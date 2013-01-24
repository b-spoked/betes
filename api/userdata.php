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

    function get($id, $installTableOnFailure = FALSE)
    {
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        try {
            $sql = 'SELECT id, name, email, newsletter FROM user WHERE id = ' . mysql_escape_string(
                $id);
            return $this->id2int($this->db->query($sql)
                                         ->fetch());
        } catch (PDOException $e) {
            if (!$installTableOnFailure && $e->getCode() == '42S02') {
                //SQLSTATE[42S02]: Base table or view not found: 1146 Table 'authors' doesn't exist
                $this->install();
                return $this->get($id, TRUE);
            }
            throw new RestException(501, 'MySQL: ' . $e->getMessage());
        }
    }

    function insert($rec)
    {

        $name = mysql_real_escape_string($rec['name']);
        $email = mysql_real_escape_string($rec['email']);
        $newsletter = mysql_real_escape_string($rec['newsletter']);
        $testingUnits = mysql_real_escape_string($rec['testingUnits']);

        $sql = "INSERT INTO user (name,email,newsletter,testingUnits,updated_at) VALUES ('$name', '$email','$newsletter','$testingUnits', NOW())";

        if (!$this->db->query($sql)) {
            return FALSE;
        }

        $id = $this->get($this->db->lastInsertId());
        return $id;
    }

    function update($id, $rec)
    {
        $name = mysql_real_escape_string($rec['name']);
        $email = mysql_real_escape_string($rec['email']);
        $newsletter = mysql_real_escape_string($rec['newsletter']);
        $testingUnits = mysql_real_escape_string($rec['testingUnits']);

        $sql = "UPDATE user SET name = '$name', email ='$email' newsletter ='$newsletter', testingUnits='$testingUnits', updated_at=NOW() WHERE id = $id";

        if (!$this->db->query($sql)) {

            $rec['id'] = $id;
            $this->insert($rec);
        }

        return $this->get($id);
    }

    function delete($id)
    {
        $r = $this->get($id);
        if (!$r || !$this->db->query(
            'DELETE FROM user WHERE id = ' . mysql_real_escape_string($id))
        ){
            return FALSE;
        }
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
            "CREATE TABLE user (
            id INT PRIMARY KEY,
            name TEXT NOT NULL ,
            email TEXT NOT NULL,
            testingUnits TEXT NOT NULL,
	        newsletter BOOL NOT NULL,
            updated_at DATETIME
        );");
    }
}