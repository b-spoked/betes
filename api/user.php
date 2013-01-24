<?php
require_once 'config.php';
class User
{
    public $userData;
    public $resultData;
    public $goalData;

    static $USER_FIELDS = array('name', 'email', 'newsletter', 'testingUnits');
    static $LOGBOOK_FIELDS = array('name','bsLevel','insulinAmount','whenDate','exerciseDuration','exerciseIntensity','comments','labels','user_id');

    function __construct()
    {
        $this->userData = new UserData();
        $this->resultData = new LogBookResultData();
        $this->goalData = new GoalData();
    }

    function get($id = NULL)
    {
        return $this->userData->get($id);
    }

    /**
     * @url GET /logbook/:id/
     */
    function getLogBook($id = NULL)
    {
        return $this->resultData->getAll($id);
    }

    /**
     * @url POST /logbook/
     */
    function addLogBookResult($rec)
    {
        return $this->resultData->insert($this->_validateLogBookResult($rec));
    }

    /**
     * @url PUT /logbook/
     */
    function updateLogBookResult($rec)
    {
        return $this->resultData->update($this->_validateLogBookResult($rec));
    }

    /**
     * @url GET /goals/:id/
     */
    function getGoals($id = NULL)
    {
        return $this->goalData->get($id);
    }

    /**
     * @url POST /goals/
     */
    function addGoal($rec)
    {
        return $this->goalData->insert($rec);
    }

    /**
     * @url PUT /goals/
     */
    function updateGoal($id,$rec)
    {
        return $this->goalData->update($id,$rec);
    }

    function post($request_data = NULL)
    {
        return $this->userData->insert($this->_validateUser($request_data));
    }

    function put($id = NULL, $request_data = NULL)
    {
        return $this->userData->update($id, $request_data);
    }

    function delete($id = NULL)
    {
        return $this->userData->delete($id);
    }

    private function _validateUser($data)
    {
        $user = array();
        foreach (User::$USER_FIELDS as $field) {
            //you may also validate the data here
            if (!isset($data[$field])) throw new RestException(417, "$field field missing");
            $user[$field] = $data[$field];
        }
        return $user;
    }

    private function _validateLogBookResult($data)
    {
        $user = array();
        foreach (User::$LOGBOOK_FIELDS as $field) {
            //you may also validate the data here
            if (!isset($data[$field])) throw new RestException(417, "$field field missing");
            $user[$field] = $data[$field];
        }
        return $user;
    }
}