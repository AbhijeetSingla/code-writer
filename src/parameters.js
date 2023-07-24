import { generateDeleteParams, generateGetParams, generateScanParams } from 'simple-dynamo-utils'

function generate_scan_code(parameters, file_string = ''){
    const { table_name, index_name = '', attributes_to_get, workers = 0, limit = 0, function_access_name } = parameters
    file_string += `async function ${function_access_name}() {`
    const params_json = JSON.stringify({...generateScanParams({
        table: table_name,
        ...(attributes_to_get !== 'all' || !attributes_to_get ? {projection: attributes_to_get.split(' ').filter(attr => attr).map(attr => attr.trim())} : {}),
        ...(limit ? {limit: limit} : {})
    }),...(index_name ? {IndexName: index_name} : {}), ...(workers ? {Segment: 'replace_var', TotalSegments: workers} : {}),}, null, 10)
    if(workers) {
        file_string += 
            `return await Promise.all([...Array(${workers}).keys()].map(segment => {
      return scan_table_function(${params_json.replace(`"replace_var"`, `segment`)})})).flat()}`
        
    } else {
        file_string += `return await scan_table_function(${params_json})}`
    }
    return file_string
}

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
        ...(attributes_to_get && attributes_to_get !== 'all' ? {projection: attributes_to_get.split(' ').filter(attr => attr).map(attr => attr.trim())} : {})
    }), null, 10).replace(`"pk_value_replace"`, `pk_value`).replace(`"sk_value_replace"`, `sk_value`)
    let function_starter_string = sort_key ? `async function ${function_access_name}(pk_value, sk_value) {` : `async function ${function_access_name}(pk_value) {`
    file_string += `${function_starter_string} \n return await get_item_function(${params_json}) \n }\n`
    return file_string
}

function generate_delete_code(parameters, file_string = ''){
    const { table_name, attributes_to_get, function_access_name, partition_key, sort_key = '' } = parameters
    const params_json = JSON.stringify(generateDeleteParams({
        table: table_name, 
        partition: {
            attribute: partition_key,
            value: 'pk_value_replace'
        }, 
        ...(sort_key ? {sort: {
            attribute: sort_key,
            value: 'sk_value_replace'
        }} : {}),
        ...(attributes_to_get && attributes_to_get === 'all' ? { returnItem: true } : {})
    }), null, 10).replace(`"pk_value_replace"`, `pk_value`).replace(`"sk_value_replace"`, `sk_value`)
    let function_starter_string = sort_key ? `async function ${function_access_name}(pk_value, sk_value) {` : `async function ${function_access_name}(pk_value) {`
    file_string += `${function_starter_string} \n return await delete_item_function(${params_json}) \n }\n`
    return file_string
}

function generate_put_code(parameters, file_string = ''){
    const { table_name, attributes_to_get = false, function_access_name } = parameters
    const params_json = JSON.stringify({ 
        TableName: table_name, 
        Item: 'item_var_replace', 
        ...(attributes_to_get && attributes_to_get === 'all' ? { ReturnValues: 'ALL_OLD' } : {})
    }, null, 10).replace('"item_var_replace"', 'item')
    file_string += `async function ${function_access_name}(item) {\n return await put_item_function( \n${params_json})\n}`
    return file_string
}

export { generate_scan_code, generate_get_code, generate_delete_code, generate_put_code }