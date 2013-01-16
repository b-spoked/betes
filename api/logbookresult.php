<?php
require_once 'config.php';
class LogBookResult {
	public $placeData;

	static $FIELDS = array('name', 'description','address','classification','labels','latitude','longitude');

	function __construct(){
		$this->placeData = new PlaceData();
		$this->commentData = new CommentData();
	}

	function get($id=NULL) {
		return is_null($id) ? $this->placeData->getAll() : $this->placeData->get($id);
	}
	
	/**
	* @url GET /filter/:filters/
	*/
	function getByFilter($filters=NULL) {
	    
		return $this->placeData->getByFilter($filters);
	}
	
	/**
	* @url PUT /address/:id/:address/
	*/
	function putAddress($id=NULL,$address=NULL)
	{    
		return $this->placeData->updateAddress($id,$address);   
	}
	
	/**
	* @url POST /comment/
	*/
	function postComment($comment_data=NULL)
	{	
		return $this->commentData->insert($comment_data);
	}
	
	/**
	* @url GET /comments/
	*/
	function getComments($noteID=NULL)
	{	
		return $this->commentData->getAllForNote($noteID);
	}
	
	/**
	* @url GET /todousers/:id/
	*/
	function getTodoUsers($id=NULL) {
		return $this->placeData->getTodoUsers($id);
	}
	
	/**
	* @url GET /recommendedusers/:id/
	*/
	function getRecommendedUsers($id=NULL) {
		return $this->placeData->getRecommendedUsers($id);
	}
	
	function post($request_data=NULL) {
		return $this->placeData->insert($this->_validate($request_data));
	}
	function put($id=NULL, $request_data=NULL) {
		return $this->placeData->update($id, $this->_validate($request_data));
	}
	function delete($id=NULL) {
		return $this->placeData->delete($id);
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