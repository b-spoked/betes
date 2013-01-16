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
class LogBookResult
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
            $sql = 'SELECT name, description, address, latitude, longitude, classification, labels, updated_at, id FROM place WHERE id = ' . mysql_escape_string(
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
    
    function insert ($rec)
    {
        $name = mysql_escape_string($rec['name']);
        $description = mysql_escape_string($rec['description']);
        $address = mysql_escape_string($rec['address']);
        $latitude = mysql_escape_string($rec['latitude']);
        $longitude = mysql_escape_string($rec['longitude']);
	$classification = mysql_escape_string($rec['classification']);
	$labels = mysql_escape_string($rec['labels']);
        $updated_at = mysql_escape_string($rec['updated_at']);
        
        $user_id = 1;
	//name, description, address, latitude, longitude, recommended, updated_at, id
        $sql = "INSERT INTO place (name,description,address,latitude,longitude,classification,labels,updated_at) VALUES ('$name', '$description','$address','$latitude','$longitude','$classification','$labels',NOW())";  
        if (! $this->db->query($sql))
            return FALSE;
        return $this->get($this->db->lastInsertId());
    }
    
    function update ($id, $rec)
    {
        $id = mysql_escape_string($id);
        $name = mysql_escape_string($rec['name']);
        $description = mysql_escape_string($rec['description']);
        $address = mysql_escape_string($rec['address']);
        $latitude = mysql_escape_string($rec['latitude']);
        $longitude = mysql_escape_string($rec['longitude']);
	$classification = mysql_escape_string($rec['classification']);
	$labels = mysql_escape_string($rec['labels']);
	
        $sql = "UPDATE place SET name = '$name', description ='$description', address ='$address', latitude ='$latitude',longitude ='$longitude', classification='$classification',labels='$labels', updated_at=NOW() WHERE id = $id";
        if (! $this->db->query($sql))
            return FALSE;
        return $this->get($id);
    }
    
    function delete ($id)
    {
        $r = $this->get($id);
        if (! $r || ! $this->db->query(
        'DELETE FROM place WHERE id = ' . mysql_escape_string($id)))
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
			"CREATE TABLE result (
            id INT AUTO_INCREMENT PRIMARY KEY ,
            name TEXT NOT NULL ,
            description TEXT NOT NULL,
			classification TEXT NOT NULL ,
			labels TEXT,
			name TEXT NOT NULL ,
            address TEXT NOT NULL,
            latitude TEXT NOT NULL,
            longitude TEXT NOT NULL,
            user_id INT,
            updated_at DATETIME
        );");
    }
}