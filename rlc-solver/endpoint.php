<?php
// RLC Solver Endpoint
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, DELETE, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        $input = file_get_contents('php://input');
        json_decode($input);
        if (json_last_error() != JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON input']);
            exit();
        }
        //$safe_input = escapeshellarg($input); // Breaks the input unfortunately.
        exec('/var/www/tristonbabers.com/private_html/cgi-bin/rlc_solver \'' . file_get_contents('php://input') . '\'', $output, $retval);
        if ($retval != 0) {
            http_response_code(400); // C++ Script failed
            exit();
        }
        echo json_encode(['Circuit_Solution' => $output]);
        //echo json_encode(['The JSON recieved is: ' => file_get_contents('php://input')]); // DEBUG
        break;
    case 'OPTIONS':
        http_response_code(200);
        exit;
    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method Not Allowed']);
        break;
}
http_response_code(200); // C++ Script failed
?>