<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        echo json_encode(['message' => 'GET request handled']);
        break;
    case 'POST':
        echo json_encode(['message' => 'POST request handled']);
        break;
    case 'PUT':
        echo json_encode(['message' => 'PUT request handled']);
        break;
    case 'DELETE':
        echo json_encode(['message' => 'DELETE request handled']);
        break;
    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method Not Allowed']);
        break;
}
?>