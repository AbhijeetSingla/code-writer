import { generateGetParams, generateScanParams } from 'simple-dynamo-utils'
function generate_get_code(parameters, file_string = ''){
    const { table_name, attributes_to_get, function_access_name, partition_key, sort_key = '' } = parameters
    const params_json = JSON.stringify(generateGetParams({ 
        table: table_name, 
        partition: {
            attribute: partition_key,
            value: 'pk_value_replace'
        }, 
        ...(sort_key ? {sort: {
            attribute: sort_key,
            value: 'sk_value_replace'
        }} : {}), 
        ...(attributes_to_get && attributes_to_get === 'all' ? {projection: attributes_to_get.split(' ').filter(attr => attr).map(attr => attr.trim())} : {})
    }), null, 10).replace(`"pk_value_replace"`, `pk_value`).replace(`"sk_value_replace"`, `sk_value`)
    let function_starter_string = sort_key ? `async function ${function_access_name}(pk_value, sk_value) {` : `async function ${function_access_name}(pk_value) {`
    file_string += `${function_starter_string} \n return await get_item_function(${params_json}) \n }\n`
    return file_string
}

export { generate_scan_code, generate_get_code }