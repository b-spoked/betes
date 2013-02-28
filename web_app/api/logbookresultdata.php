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
class LogBookResultData
{
    private $db;

    function __construct()
    {

        try {
            $this->db = new PDO(DB_SERVER, DB_USER, DB_PASSWORD);
            $this->db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE,
                                    PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RestException(501, 'MySQL: ' . $e->getMessage());
        }
    }

    function getAll($userId, $installTableOnFailure = FALSE)
    {
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        try {
            $sql = "SELECT name,bsLevel,insulinAmount,resultDate,exerciseDuration,exerciseIntensity,comments,labels,userId,updated_at, id FROM result WHERE userId = '$userId'";
			
            return $this->id2int($this->db->query($sql)->fetchAll());
        } catch (PDOException $e) {
            if (!$installTableOnFailure && $e->getCode() == '42S02') {
                //SQLSTATE[42S02]: Base table or view not found: 1146 Table 'authors' doesn't exist
                $this->install();
                return $this->getAll($userId, TRUE);
            }
            throw new RestException(501, 'MySQL: ' . $e->getMessage());
        }
    }
	
	function get($id, $installTableOnFailure = FALSE)
    {
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        try {
            $sql = 'SELECT name,bsLevel,insulinAmount,resultDate,exerciseDuration,exerciseIntensity,comments,labels,userId,updated_at, id FROM result WHERE id = ' . mysql_escape_string(
                $id);
            return $this->id2int($this->db->query($sql)->fetch());
        } catch (PDOException $e) {
            if (!$installTableOnFailure && $e->getCode() == '42S02') {
                //SQLSTATE[42S02]: Base table or view not found: 1146 Table 'authors' doesn't exist
                $this->install();
                return $this->getAll($userId, TRUE);
            }
            throw new RestException(501, 'MySQL: ' . $e->getMessage());
        }
    }

    function insert($rec)
    {
        $bsLevel = mysql_escape_string($rec['bsLevel']);
        $name = mysql_escape_string($rec['name']);
        $insulinAmount = mysql_escape_string($rec['insulinAmount']);
        $resultDate = mysql_escape_string($rec['resultDate']);
        $exerciseDuration = mysql_escape_string($rec['exerciseDuration']);
        $exerciseIntensity = mysql_escape_string($rec['exerciseIntensity']);
        $comments = mysql_escape_string($rec['comments']);
        $labels = mysql_escape_string($rec['labels']);
        $userId = mysql_escape_string($rec['userId']);

        $sql = "INSERT INTO result (name,bsLevel,insulinAmount,resultDate,exerciseDuration,exerciseIntensity,comments,labels,userId,updated_at) VALUES ('$name','$bsLevel','$insulinAmount','$resultDate','$exerciseDuration','$exerciseIntensity','$comments','$labels','$userId',NOW())";
        
		if (!$this->db->query($sql)){
            return false;
        }
        return $this->get($this->db->lastInsertId());
    }

    function update($rec)
    {
        $id = mysql_escape_string($rec['id']);
        $bsLevel = mysql_escape_string($rec['bsLevel']);
        $name = mysql_escape_string($rec['name']);
        $insulinAmount = mysql_escape_string($rec['insulinAmount']);
        $resultDate = mysql_escape_string($rec['resultDate']);
        $exerciseDuration = mysql_escape_string($rec['exerciseDuration']);
        $exerciseIntensity = mysql_escape_string($rec['exerciseIntensity']);
        $comments = mysql_escape_string($rec['comments']);
        $labels = mysql_escape_string($rec['labels']);

        $sql = "UPDATE result SET name = '$name', bsLevel ='$bsLevel', insulinAmount ='$insulinAmount', resultDate ='$resultDate', exerciseDuration ='$exerciseDuration', exerciseIntensity ='$exerciseIntensity', comments='$comments',labels='$labels', updated_at=NOW() WHERE id = $id";
        if (!$this->db->query($sql)){
            return false;
        }
        return $this->get($id);
    }

    function delete($id)
    {
        $r = $this->get($id);
        if (!$r || !$this->db->query(
            'DELETE FROM result WHERE id = ' . mysql_escape_string($id))
        )
            return FALSE;
        return $r;
    }

    private function id2int($r)
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

    private function install()
    {
        $this->db->exec(
            "CREATE TABLE result (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name TEXT NOT NULL,
            bsLevel DECIMAL(3,1),
			insulinAmount INT,
			resultDate DATETIME,
			exerciseDuration INT,
            exerciseIntensity TEXT NOT NULL,
            labels TEXT,
            comments TEXT,
            userId varchar(64) NOT NULL,
            updated_at DATETIME
        );");
    }
}