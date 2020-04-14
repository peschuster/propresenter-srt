# ProPresenter SRT

ProPresenter SRT creates SRT files by listening to the Stage Display interface of ProPresenter.

*.srt files are generated on ending the program (Ctrl+C).

## Usage

    node index.js <propresenter-ip> <propresenter-port> <stagedisplay-password> [export-filename] [translations (0|1)]

### Parameters

  - `<propresenter-ip>` - IP address of the Mac/PC running ProPresenter
  - `<propresenter-port>` - Port shown in the ProPresenter preferences dialog for network access
  - `<stagedisplay-password>` - Password set in the ProPresenter preferences dialog for Stage Display access
  - `[export-filename]` - (optional) Filename prefix to be used for generated files
  - `[translations (0|1)]` - (optional) Default is "1", to split texts every other line in "main" and "translation" to different *.srt files
