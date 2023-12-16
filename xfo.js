#!node

/* ./xfo '0031 date date word words amt' 'date amt blank blank words hi' foo.txt > foo.csv */
/* ./xfo 'date date words words word amt' 'date words blank blank amt' Chase5605_Activity20230814_20230913_20231216.CSV > chase.csv */

const fs = require('fs')

const clog = console.log.bind(console)
const cerr = console.error.bind(console)

const dict = {
  date: '\\d+\\/\\d+(\\/*\\d*)?',
  word: '\\w+',
  words: '.+',
  amt: '-?\\d+\\.\\d+'
}

const dict2 = {
  blank: '',
}

// Function to replace spaces with commas
function replacePattern(inputFormat, outputFormat, inputFilePath) {
  fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
      cerr('Error reading', inputFilePath + ': ' + err)
      return
    }

    const lines = data.split('\n')
    const separator = inputFilePath.toLowerCase().endsWith('.csv') ? ',' : ' '
    const regex = makeInputRegex(inputFormat, separator)

    const outs = outputFormat.split(' ')

    for (const line of lines) {
      const match = regex.exec(line)
      if (match) {
        const { groups } = match
        const emit = outs.map(out => {
          if (dict2[out] !== undefined) {
            return dict2[out]
          } else if (groups[out] !== undefined) {
            return groups[out]
          } else {
            return out
          }
        }).join(',')
        clog(emit)
      } else {
        cerr('did not match "' + line + '"')
      }
    }
  })
}

// Getting input and output filenames from command line arguments
const args = process.argv.slice(2); // Extracting command line arguments

if (args.length !== 3) {
  clog('Usage: xfo inputFormat outputFormat fileName')
} else {
  const [inputFormat, outputFormat, inputFileName] = args

  replacePattern(inputFormat, outputFormat, inputFileName)
}


function makeInputRegex(inputFormat, separator) {
  const pats = inputFormat.split(' ')
  const counts = {}
  const pats2 = pats.map(pat => {
    if (dict[pat]) {
      counts[pat] = counts[pat] ? counts[pat] + 1 : 1
      const name = counts[pat] === 1 ? pat : pat + counts[pat]
      return '(?<' + name + '>' + dict[pat] + ')'
    } else {
      return pat
    }
  }).join(separator)
  cerr('regex:', pats2)
  const regex = new RegExp(pats2, 'i')
  return regex
}

