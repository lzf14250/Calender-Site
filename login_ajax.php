<?php
/*this php accept two parameters, one is username,
the other is password, returns json containing if successfully
login and if there are some events need to be accepted*/
header("Content-Type: application/json");
require('database.php');

  $input_json = json_decode(file_get_contents("php://input"),true);
  $username = $input_json['username'];
  $password = $input_json['password'];

  $stmt = $mysqli->prepare("SELECT * FROM users WHERE username=?");
  $stmt->bind_param('s',$username);
  $stmt->execute();
  $result = $stmt->get_result();
  $row = $result->fetch_assoc();
  $stmt->close();

  if (empty($row)) {
    //username not found
    echo json_encode(array(
      "success" => false,
      "message" => "username not exists"
    ));
    exit;
  } else if (password_verify($password,$row["password"])) {
    //successfully login
    session_start();
    $_SESSION['username'] = $username;
    $_SESSION['id'] = $row["id"];
    $_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32));
    echo json_encode(array(
      "success" => true,
      "token" => $_SESSION['token'],
      "message" => "successfully login!"
    ));
    exit;
  } else {
    //incorrect password
    echo json_encode(array(
      "success" => false,
      "message" => "username and password do not match"
    ));
    exit;
  }

?>
