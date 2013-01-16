<?php
/**
 * MySQL DB. All data is stored in data_pdo_mysql database
 * Create an empty MySQL database and set the dbname, username
 * and password below
 * 
 * This class will create the table with sample data
 * automatically on first `get` or `get($id)` request
 */
require_once 'config.php';
class UserData
{
    private $db;
    function __construct(){
	
	try {
            $this->db = new PDO(DB_SERVER, DB_USER, DB_PASSWORD);
            $this->db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, 
            PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RestException(501, 'MySQL: ' . $e->getMessage());
        }
     }
    
    function get ($id, $installTableOnFailure = FALSE)
    {
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        try {
            $sql = 'SELECT id, name, email, newsletter FROM user WHERE id = ' . mysql_escape_string(
            $id);
            return $this->id2int($this->db->query($sql)
                ->fetch());
        } catch (PDOException $e) {
            if (! $installTableOnFailure && $e->getCode() == '42S02') {
//SQLSTATE[42S02]: Base table or view not found: 1146 Table 'authors' doesn't exist
                $this->install();
                return $this->get($id, TRUE);
            }
            throw new RestException(501, 'MySQL: ' . $e->getMessage());
        }
    }
    
    function getTodos($id, $installTableOnFailure = FALSE){
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        try {
            
           $queryString = "SELECT id, name, description, address, latitude, longitude, recommended FROM place LEFT JOIN user_todo_place ON user_todo_place.todo_id = place.id WHERE user_todo_place.user_id = '{$id}'";
	    
            return $this->id2int($this->db->query($queryString)->fetchAll());
            
        } catch (PDOException $e) {
            if (! $installTableOnFailure && $e->getCode() == '42S02') {
//SQLSTATE[42S02]: Base table or view not found: 1146 Table 'authors' doesn't exist
                $this->install();
                return $this->getTodos($id, TRUE);
            }
            throw new RestException(501, 'MySQL: ' . $e->getMessage());
        }
    }
    
    function getRecommended($id, $installTableOnFailure = FALSE){
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        try {
	    
	    $queryString = "SELECT id, name, description, address, latitude, longitude, recommended FROM place LEFT JOIN user_recommended_place ON user_recommended_place.recommended_id =place.id WHERE user_recommended_place.user_id = '{$id}'";
	    
            return $this->id2int($this->db->query($queryString)->fetchAll());
            
        } catch (PDOException $e) {
            if (! $installTableOnFailure && $e->getCode() == '42S02') {
//SQLSTATE[42S02]: Base table or view not found: 1146 Table 'authors' doesn't exist
                $this->install();
                return $this->getRecomended($id, TRUE);
            }
            throw new RestException(501, 'MySQL: ' . $e->getMessage());
        }
    }
    
    function getCreated($id, $installTableOnFailure = FALSE){
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        try {
            
            $queryString = "SELECT id, name, description, address, latitude, longitude, recommended FROM place LEFT JOIN user_created_place ON user_created_place.created_id =place.id WHERE user_created_place.user_id = '{$id}'";
	    return $this->id2int($this->db->query($queryString)->fetchAll());
            
        } catch (PDOException $e) {
            if (! $installTableOnFailure && $e->getCode() == '42S02') {
//SQLSTATE[42S02]: Base table or view not found: 1146 Table 'authors' doesn't exist
                $this->install();
                return $this->getCreated($id, TRUE);
            }
            throw new RestException(501, 'MySQL: ' . $e->getMessage());
        }
    }
    
    function insert ($rec)
    {
	
        $thirdparty_id= mysql_escape_string($rec['thirdparty_id']);
        $name = mysql_escape_string($rec['name']);
        $thumbnail = mysql_escape_string($rec['thumbnail']);
        $email = mysql_escape_string($rec['email']);
        $newsletter= mysql_escape_string($rec['newsletter']);
        $todos = $rec['todos'];
        $recommended = $rec['recommended'];
	
        $sql = "INSERT INTO user (thirdparty_id,name,email,newsletter,thumbnail,updated_at) VALUES ('$thirdparty_id', '$name', '$email','$newsletter','$thumbnail', NOW())";  
    
	if (!$this->db->query($sql)){
            return FALSE;
	}
	
	$id = $this->get($this->db->lastInsertId());
	
	if($todos){
	    $this->insertTodos($id,$todos);
	}
	if($recommended){
	    $this->insertRecommended($id,$recommended);
	}
	
	return $id;
        
    }
    
    function update ($id, $rec)
    {
	$name = mysql_escape_string($rec['name']);
        $email = mysql_escape_string($rec['email']);
        $thirdparty_id= mysql_escape_string($rec['thirdparty_id']);
        $newsletter= mysql_escape_string($rec['newsletter']);
        $thumbnail = mysql_escape_string($rec['thumbnail']);
        $todos = $rec['todos'];
        $recommended = $rec['recommended'];
	
        $sql = "UPDATE user SET name = '$name', email ='$email', thirdparty_id = '$thirdparty_id', thumbnail = '$thumbnail', newsletter ='$newsletter', updated_at=NOW() WHERE id = $id";
        
	if (! $this->db->query($sql)){
	    
	    $rec['id'] = $id;
            $this->insert($rec);
	}
	
	if($todos){
	    $this->insertTodos($id,$todos);
	}
	if($recommended){
	    $this->insertRecommended($id,$recommended);
	}
	
        return $this->get($id);
    }
    
    function insertRecommended($id,$recommended){
	
	foreach ($recommended as $recommended_id)
	{
	   $sql = " INSERT IGNORE INTO user_recommended_place (user_id,recommended_id) VALUES ('$id','$recommended_id')";
	   $this->db->query($sql);
	}
    }
    
    function insertTodos($id,$todos){
	
	foreach ($todos as $todo_id)
	{
	   $sql = " INSERT IGNORE INTO user_todo_place (user_id,todo_id) VALUES ('$id','$todo_id')";
	   $this->db->query($sql);
	}
    }
    
    function delete ($id)
    {
        $r = $this->get($id);
        if (! $r || ! $this->db->query(
        'DELETE FROM user WHERE id = ' . mysql_escape_string($id)))
            return FALSE;
        return $r;
    }
    private function id2int ($r)
    {
        if (is_array($r)) {
            if (isset($r['id'])) {
                $r['id'] = intval($r['id']);
            } else {
                foreach ($r as &$r0) {
                    $r0['id'] = intval($r0['id']);
                }
            }
        }
        return $r;
    }
    private function install ()
    {
        $this->db->exec(
        "CREATE TABLE user (
            id INT PRIMARY KEY ,
	    thirdparty_id INT NOT NULL,
            name TEXT NOT NULL ,
            email TEXT NOT NULL,
	    newsletter BOOL NOT NULL,
            updated_at DATETIME
        );");
	
	//logbook user relationship
	$this->db->exec(
        "CREATE TABLE user_logbook
	(
	    user_id INT REFERENCES user (id),
	    logbook_id INT REFERENCES logbook (id),
	    PRIMARY KEY (user_id, logbook_id)
	);");
	
	//goals user relationship
	$this->db->exec(
        "CREATE TABLE user_goal
	(
	    user_id INT REFERENCES user (id),
	    goal_id INT REFERENCES goal (id),
	    PRIMARY KEY (user_id, goal_id)
	);");
	
	
    }
}