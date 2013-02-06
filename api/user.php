<?php
require_once 'config.php';
class User
{
    public $userData;
    public $resultData;
    public $goalData;
	
	/*
	{"name":"Jamie Kimber-Bate",
	"newsletter":false,
	"thirdPartyId":"529453804",
	"thumbnailPath":"http://graph.facebook.com/529453804/picture?type=square",
	"authenticated":true,
	"testingUnits":"mmol/l",
	"logEntries":[],
	"userGoals":[],
	"sid":"new",
	"updated_at":"2013-02-04T09:43:19.497Z",
	"dirty":true,
	"email":"unknown"}
	*/
	
    static $USER_FIELDS = array('name', 'email', 'testingUnits','newsletter','thumbnailPath','thirdPartyId');
    static $LOGBOOK_FIELDS = array('name','bsLevel','insulinAmount','whenDate','exerciseDuration','exerciseIntensity','comments','labels','user_id');

    function __construct()
    {
        $this->userData = new UserData();
        $this->resultData = new LogBookResultData();
        $this->goalData = new GoalData();
    }

    function get($id = NULL)
    {
		if(is_null($id)){
			return false;
		}
        return $this->userData->get($id);
    }

	/**
     * @url GET /login/
     */
    function login($rec)
    {
		if(is_null($rec)){
			return false;
		}
        return $this->userData->getId($rec);
    }

    /**
     * @url GET /logbook/:id/
     */
    function getLogBook($id = NULL)
    {
		if(is_null($id)){
			return false;
		}
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
		if(is_null($id)){
			return false;
		}
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
		if(is_null($id)){
			return false;
		}
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