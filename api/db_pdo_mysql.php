<?php
/**
 * MySQL DB. All data is stored in data_pdo_mysql database
 * Create an empty MySQL database and set the dbname, username
 * and password below
 * 
 * This class will create the table with sample data
 * automatically on first `get` or `get($id)` request
 */
class NoteData
{
    private $db;
    function __construct ()
    {
        try {
            $this->db = new PDO(
            'mysql:host=adminwww.db.7946997.hostedresource.com;dbname=adminwww', 'adminwww', 'Sabine2010');
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
            $sql = 'SELECT * FROM notes WHERE id = ' . mysql_escape_string(
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
    function getAll ($installTableOnFailure = FALSE)
    {
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        try {
            $stmt = $this->db->query('SELECT * FROM notes');
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
    
    function getByKeyword($keyword,$installTableOnFailure = FALSE)
    {
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        try {
            
            $query = "SELECT * FROM notes WHERE tags LIKE '%{$keyword}%' OR name LIKE '%{$keyword}%' OR description LIKE '%{$keyword}%'";
            
            $stmt = $this->db->query($query);
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
    
    function getByTag($tag, $installTableOnFailure = FALSE){
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        try {
            
            $stmt = $this->db->query("SELECT * FROM notes WHERE tags LIKE '%{$tag}%'");
            return $this->id2int($stmt->fetchAll());
            
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
        $tags = mysql_escape_string($rec['tags']);
        $sql = "INSERT INTO notes (name,description,address,latitude,longitude, tags) VALUES ('$name', '$description','$address','$latitude','$longitude','$tags')";  
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
        $tags = mysql_escape_string($rec['tags']);
        $sql = "UPDATE notes SET name = '$name', description ='$description', address ='$address', latitude ='$latitude',longitude ='$longitude', tags='$tags'  WHERE id = $id";
        if (! $this->db->query($sql))
            return FALSE;
        return $this->get($id);
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
        "CREATE TABLE notes (
            id INT AUTO_INCREMENT PRIMARY KEY ,
            name TEXT NOT NULL ,
            description TEXT NOT NULL,
            address TEXT NOT NULL,
            latitude TEXT NOT NULL,
            longitude TEXT NOT NULL,
            tags TEXT
            
        );");
        $this->db->exec(
        "INSERT INTO notes (name, description,address,latitude,longitude,tags) VALUES ('Beach Walk','Beach loop from the back beach ending at the playground','Back Beach Road, Tahunanui, Nelson','-41.285974','173.23166','walk, beach, playground');
        INSERT INTO notes (name, description,address,latitude,longitude,tags) VALUES ('Wasington Valley Playground','A great little playground that has become a family fav with a new play house and good swings','Pioneer Park, Washington Valley, Nelson','-41.272525','173.275487','playground');
        INSERT INTO notes (name, description,address,latitude,longitude,tags) VALUES ('Model Train Ride','A hit with the whole family are the great train rides at the modelers pond - they even have Thomas!','Modelers pond, Tahunanui, Nelson','-41.281806','173.24388','trains, beach');
            ");
    }
}