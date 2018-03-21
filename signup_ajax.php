<?php
/*this php accept two parameters, one is username,
the other is password, returns a json containing
message*/
header("Content-Type: application/json");
require('database.php');

$input_json = json_decode(file_get_contents("php://input"),true);
$username = $input_json['username'];
$password = $input_json['password'];

if ($username=="") {
  //username is empty
  echo json_encode(array(
    "success" => false,
    "message" => "username can not be empty"
  ));
  exit;
} else if (!preg_match('/^[\w_\-]+$/',$username)) {
  //invalid username
  echo json_encode(array(
    "success" => false,
    "message" => "username is invalid"
  ));
  exit;
} else if (strlen($username)>12) {
  //username is too long
  echo json_encode(array(
    "success" => false,
    "message" => "username should be limited less than 12 characters"
  ));
  exit;
} else {
  //username is valid
  $stmt = $mysqli->prepare("SELECT * FROM users WHERE username=?");
  $stmt->bind_param('s',$username);
  $stmt->execute();
  $search_result = $stmt->get_result();
  $row = $search_result->fetch_assoc();
  $stmt->close();   //close the $stmt

  if (!empty($row)) {
    //username already exists
    echo json_encode(array(
      "success" => false,
      "message" => "This username has already existed"
    ));
    exit;
  } else {
    //sign up a new username and hash the password
    $options = [
        'salt' => mcrypt_create_iv(22, MCRYPT_DEV_URANDOM), //add the random salt
    ];
    $password_hashed = password_hash($password, PASSWORD_BCRYPT, $options);
    $stmt = $mysqli->prepare("insert into users (username,password) values (?, ?)");
    $stmt->bind_param('ss',$username,$password_hashed);
    $stmt->execute();
    $stmt->close();

    echo json_encode(array(
      "success" => true,
      "message" => "successfully signup!"
    ));
    exit;
  }
}

?>
