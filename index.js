import { format } from 'prettier'
import { createWriteStream } from 'fs'
import { generate_get_code, generate_scan_code } from './parameters.js'

import structure from './sample_api_basic.json' assert { type: "json" };

const file_strings = {}
const base_location = './generated_code_output/'

for (let index = 0; index < structure.length; index++) {
    const { access_type, file_name = 'generated_code', ...rest } = structure[index];
    if(!file_strings.hasOwnProperty(file_name)) {
        file_strings[file_name] = ''
    }
    switch (access_type) {
        case 'scan':
            file_strings[file_name] += generate_scan_code(rest)
            break;
    
        case 'get':
            file_strings[file_name] += generate_get_code(rest)
            break;
    
        default:
            break;
    }
    
}

for (const key in file_strings) {
    console.log('why??: ', file_strings);
    format(file_strings[key], {
        parser: 'meriyah'
    }).then(data => {
        createWriteStream(`${base_location}${key}.js`).write(data)
    })
}

console.log('complete')