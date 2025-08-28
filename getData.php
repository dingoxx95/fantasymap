<?php 

// HTTP request management to load JSON data
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    $data = getData();
    echo json_encode($data);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function getData() {
    $jsonFile = 'data.json';
    
    if (!file_exists($jsonFile)) {
        throw new Exception('Data file not found');
    }
    
    $json = file_get_contents($jsonFile);
    
    if ($json === false) {
        throw new Exception('Failed to read data file');
    }
    
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }
    
    return $data;
}

