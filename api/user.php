<?php
require_once 'config.php';
class User {
	public $userData;
	public $resultData;

	static $FIELDS = array('name', 'email','newsletter');

	function __construct(){
		$this->userData = new UserData();
		$this->resultData = new LogBookResultData();
	}

	function get($id=NULL) {
		return $this->userData->get($id);
	}
	
	/**
	* @url GET /logbook/:id/
	*/
	function getLogBook($id=NULL) {
		return $this->resultData->getAll($id);
	}
	
	/**
	* @url POST /logbook/
	*/
	function insertResult($rec){
		return $this->resultData->insert($id,$rec);
	}
	
	/**
	* @url PUT /logbook/
	*/
	function updateResult($rec){
		return $this->resultData->update($id,$rec);
	}
	
	/**
	* @url GET /goals/:id/
	*/
	function getGoals($id=NULL) {
		return $this->userData->getRecommended($id);
	}
	
	
	function post($request_data=NULL) {
		return $this->userData->insert($this->_validate($request_data));
	}
	
	function put($id=NULL, $request_data=NULL) {
	
		return $this->userData->update($id, $request_data);
	}
	function delete($id=NULL) {
		return $this->userData->delete($id);
	}

	private function _validate($data){
		$user=array();
		foreach (User::$FIELDS as $field) {
//you may also vaildate the data here
			if(!isset($data[$field]))throw new RestException(417,"$field field missing");
			$user[$field]=$data[$field];
		}
		return $user;
	}
}