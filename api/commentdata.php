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
class CommentData
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
            $sql = 'SELECT comment, rating FROM comments WHERE id = ' . mysql_escape_string(
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
    function getAllForNote ($noteID,$installTableOnFailure = FALSE)
    {
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        try {
            $stmt = $this->db->query("SELECT comment, rating FROM comments WHERE noteID = '$noteID'");
            return $this->id2int($stmt->fetchAll());
        } catch (PDOException $e) {
            if (! $installTableOnFailure && $e->getCode() == '42S02') {
//SQLSTATE[42S02]: Base table or view not found: 1146 Table 'authors' doesn't exist
                $this->install();
                return $this->getAll(TRUE);
            }
            throw new RestException(501, 'MySQL: ' . $e->getMessage());
        }
    }
    
    function insert ($rec)
    {
        $comment = mysql_escape_string($rec['comment']);
        $rating = mysql_escape_string($rec['rating']);
        $userID = mysql_escape_string($rec['userID']);
        $noteID = mysql_escape_string($rec['noteID']);
        
        $addedby = 1;
        $sql = "INSERT INTO comments (comment,rating,userID,noteID,addedon) VALUES ('$comment', '$rating','$userID','$noteID',CURDATE())";  
        if (! $this->db->query($sql))
            return FALSE;
        return $this->get($this->db->lastInsertId());
    }
    
    function delete ($id)
    {
        $r = $this->get($id);
        if (! $r || ! $this->db->query(
        'DELETE FROM notes WHERE id = ' . mysql_escape_string($id)))
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
        "CREATE TABLE comments (
            id INT AUTO_INCREMENT PRIMARY KEY ,
            comment TEXT NOT NULL ,
            rating INT,
            userID INT NOT NULL,
            noteID INT NOT NULL,
            addedon DATE
        );");
	
	$this->db->exec(
        "INSERT INTO comments (comment, rating,userID,noteID,addedon) VALUES ('The walk was fantastic, we had a buggy and it was no dramas at all.','4','2','2',CURDATE());
        INSERT INTO comments (comment, rating,userID,noteID,addedon) VALUES ('We have both a 2 and 5 year old and they were both entertained at the playground.','4','2','2',CURDATE());
        INSERT INTO comments (comment, rating,userID,noteID,addedon) VALUES ('The kids totally ignored the playground but loved the ducks!.','4','2','2',CURDATE());
        INSERT INTO comments (comment, rating,userID,noteID,addedon) VALUES ('A bit too challenging for our 3 year but would be good for older kids.','3','2','2',CURDATE());
        INSERT INTO comments (comment, rating,userID,noteID,addedon) VALUES ('The toilet was a nightmare - no water and unclean! Steer clear.','1','2','2',CURDATE());
        INSERT INTO comments (comment, rating,userID,noteID,addedon) VALUES ('The good - trains where a massive hit. The bad - trying to get the kids to leave. Awesome!!','5','2','2',CURDATE());
            ");
    }
}