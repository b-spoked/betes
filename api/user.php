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
	
	/*
	 {"name":"Dinner",
	 "bsLevel":"7.5",
	 "resultDate":"2013-02-07 18:15:43",
	 "insulinAmount":"",
	 "exerciseDuration":"",
	 "exerciseIntensity":"",
	 "labels":"",
	 "comments":"",
	 "goals":"goals-not-meet",
	 "userId":"30",
	 "updated_at":"2013-02-07T09:16:08.601Z",
	 "dirty":true}
	*/
	
    static $USER_FIELDS = array('name', 'email', 'testingUnits','newsletter','thumbnailPath','thirdPartyId');
    static $LOGBOOK_FIELDS = array('name','bsLevel','insulinAmount','resultDate','exerciseDuration','exerciseIntensity','comments','labels','userId');

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
		
		$user = $this->userData->get($id);
		
		/*$results = $this->resultData->getAll($id);
		if($results){
			$user['results'] = $results;
		}
		$goals = $this->goalData->getAll($id);
		if($goals){
			$user['goals'] = $goals;
		}*/
		
		return $user;
		
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
    function addLogBookResult($request_data=null)
    {
        return $this->resultData->insert($this->_validateLogBookResult($request_data));
    }

    /**
     * @url PUT /logbook/
     */
    function updateLogBookResult($request_data=null)
    {
        return $this->resultData->update($this->_validateLogBookResult($request_data));
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
		
		if($user['thirdPartyId'] <= 0){
			throw new RestException(417, "user thirdPartyId not set");
		}
		if($user['name'] == ""){
			throw new RestException(417, "user name not set");
		}
		
        return $user;
    }

    private function _validateLogBookResult($data)
    {
        $log = array();
        foreach (User::$LOGBOOK_FIELDS as $field) {
            //you may also validate the data here
            if (!isset($data[$field])) throw new RestException(417, "$field field missing");
            $log[$field] = $data[$field];
        }
        return $log;
    }
}