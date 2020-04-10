const WebSocket = require('ws')
const fs = require('fs')

const config = {
    host: process.argv[2] || '10.198.9.112',
    port: process.argv[3] || 49476,
    password: process.argv[4] || '123456',
    filename: process.argv[5] || new Date().toISOString().replace(/:|\./g, '')
}

const client = new WebSocket(`ws://${config.host}:${config.port}/stagedisplay`);

client.on('open', function open() {
    console.log(`Opened connection to: ${config.host}:${config.port}`);
    client.send(JSON.stringify({
        pwd: config.password,
        ptl: 610,
        acn: 'ath'
    }));

});

client.on('error', function (err) { console.error(err) });
client.on('connect', function () { console.log('Connection established'); });
client.on('close', function(_code, _reason) { console.log('Connection closed') });

client.on('message', function(message) { onMessage(message); });

function onMessage(message) {
	var objData = JSON.parse(message);
	switch(objData.acn) {
		case 'ath':
			if (objData.ath === true) {
                console.log('auth ok');
			} else {
                console.log('auth error');
			}
			break;
        case 'fv':
            const cs = objData.ary.find(a => a.acn === 'cs')
            if (cs) {
                handleText(cs.txt)
            }
            break
		default:
			break;
	}
};

const startTs = new Date()
const srtObjects = []

function handleText(text) {
    if (!text) text = ''
    const currentTs = new Date()

    let previousSrt = undefined
    if (srtObjects.length > 0) {
        previousSrt = srtObjects[srtObjects.length - 1]
    }

    if (previousSrt && previousSrt.end === undefined) {
        previousSrt.end = currentTs
    }
    if (text !== '') {
        const lines = text.split(/\r\n|\r|\n/)
        const main = []
        const trans = []
        for (let i = 0; i < lines.length; i++) {
            if (i % 2 === 0) main.push(lines[i])
            else trans.push(lines[i])
        }

        srtObjects.push({
            start: currentTs,
            end: undefined,
            main,
            trans
        })        
    }
}

function printTwo(input) {    
    if (input === 0) return '00'
    else if (input < 10) return '0' + input
    else return '' + input
}

function formatTime(ts) {
    const hours = Math.floor(ts / 3600000)
    const minutes = Math.floor((ts - (hours * 3600000)) / 60000)
    const seconds = Math.floor((ts - (hours * 3600000) - (minutes * 60000)) / 1000)
    const milli = ts - (hours * 3600000) - (minutes * 60000) - (seconds * 1000)

    return `${printTwo(hours)}:${printTwo(minutes)}:${printTwo(seconds)},${milli}`
}

process.on('SIGINT', function() {
    console.log('Caught interrupt signal');

/*
SRT FORMAT (Wikipedia)
168
00:20:41,150 --> 00:20:45,109
- How did he do that?
- Made him an offer he couldn't refuse.
*/

    const mainOut = []
    const transOut = []
    let i = 1;
    for (const srt of srtObjects) {
        mainOut.push(i)
        mainOut.push(`${formatTime(srt.start - startTs)} --> ${formatTime((srt.end || (new Date())) - startTs)}`)
        mainOut.push(srt.main.join('\r\n'))
        mainOut.push('')
        
        transOut.push(i++)
        transOut.push(`${formatTime(srt.start - startTs)} --> ${formatTime((srt.end || (new Date())) - startTs)}`)
        transOut.push(srt.trans.join('\r\n'))
        transOut.push('')
    }

    fs.writeFileSync(config.filename + '_main.srt', mainOut.join('\r\n'), { encoding: 'utf8' })
    fs.writeFileSync(config.filename + '_trans.srt', transOut.join('\r\n'), { encoding: 'utf8' })

    process.exit();
});