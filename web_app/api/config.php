<?php
$url=parse_url(getenv("CLEARDB_DATABASE_URL"));

$server = $url["host"];
$username = $url["user"];
$password = $url["pass"];
$db = substr($url["path"],1);

define('DB_SERVER', 'mysql:host='+$server+'dbname='+$db);
define('DB_USER', $username);
define('DB_PASSWORD', $password);
