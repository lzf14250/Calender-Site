<?php
  if (!isset($_SESSION)){
    session_start();
  }
  session_destroy();
  header("Content-Type: application/json");
  echo json_encode(array(
    "success" => true,
    "message" => "successfully login!"
  ));
  exit;
?>
