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
class GoalData
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
            $sql = 'SELECT id, bsLowerRange, bsFrequency, exerciseDuration, exerciseFrequency, longTermGoalDate, longTermGoalDate FROM goal WHERE id = ' . mysql_escape_string(
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
        $bsLowerRange = mysql_escape_string($rec['bsLowerRange']);
        $bsFrequency = mysql_escape_string($rec['bsFrequency']);
        $exerciseDuration = mysql_escape_string($rec['exerciseDuration']);
        $exerciseFrequency = mysql_escape_string($rec['exerciseFrequency']);
        $longTermGoal = mysql_escape_string($rec['longTermGoal']);
        $longTermGoalDate = mysql_escape_string($rec['longTermGoalDate']);

        $sql = "INSERT INTO goal (bsLowerRange, bsFrequency, exerciseDuration, exerciseFrequency, longTermGoalDate, longTermGoalDate) VALUES ('$bsLowerRange', '$bsFrequency','$exerciseDuration','$exerciseFrequency','$longTermGoal','$longTermGoalDate' NOW())";

        if (!$this->db->query($sql)) {
            return FALSE;
        }

        $id = $this->get($this->db->lastInsertId());
        return $id;
    }

    function update($id, $rec)
    {
        $bsLowerRange = mysql_escape_string($rec['bsLowerRange']);
        $bsFrequency = mysql_escape_string($rec['bsFrequency']);
        $exerciseDuration = mysql_escape_string($rec['exerciseDuration']);
        $exerciseFrequency = mysql_escape_string($rec['exerciseFrequency']);
        $longTermGoal = mysql_escape_string($rec['longTermGoal']);
        $longTermGoalDate = mysql_escape_string($rec['longTermGoalDate']);

        $sql = "UPDATE goal SET bsLowerRange = '$bsLowerRange', bsFrequency ='$bsFrequency', exerciseDuration ='$exerciseDuration', exerciseFrequency='$exerciseFrequency', longTermGoal='$longTermGoal', longTermGoalDate='$longTermGoalDate', updated_at=NOW() WHERE id = $id";

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
            'DELETE FROM goal WHERE id = ' . mysql_escape_string($id))
        ) {
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
        //bsLowerRange, bsFrequency, exerciseDuration, exerciseFrequency, longTermGoalDate, longTermGoalDate

        $this->db->exec(
            "CREATE TABLE goal (
            id INT PRIMARY KEY,
            bsLowerRange  DECIMAL(3,1),
            bsFrequency INT,
            exerciseDuration INT,
	        exerciseFrequency INT,
	        longTermGoalDate TEXT,
	        longTermGoalDate DATE,
            updated_at DATETIME
        );");
    }
}