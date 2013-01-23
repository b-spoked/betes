<?php
require_once 'config.php';
class LogBookResult {
	public $resultData;

	static $FIELDS = array('name', 'description','address','classification','labels','latitude','longitude');

	function __construct(){
		$this->resultData = new LogBookResultData();
	}

	function get($userId=NULL) {
		return $this->resultData->getAll($userId);
	}
	
	function post($request_data=NULL) {
		return $this->resultData->insert($this->_validate($request_data));
	}
	function put($id=NULL, $request_data=NULL) {
		return $this->resultData->update($id, $this->_validate($request_data));
	}
	function delete($id=NULL) {
		return $this->resultData->delete($id);
	}

	private function _validate($data){
		$note=array();
		foreach (Place::$FIELDS as $field) {
//you may also vaildate the data here
			if(!isset($data[$field]))throw new RestException(417,"$field field missing");
			$note[$field]=$data[$field];
		}
		return $note;
	}
}