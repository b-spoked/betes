<?php
//jsonpformat.php
class JsonpFormat implements iFormat {
 
    const MIME = 'text/javascript';
    const EXTENSION = 'js';
    /*
     * JsonFormat is used internally
     * @var JsonFormat;
     */
    public $jsonFormat;
    public static $functionName = 'parseResponse';
 
    public function __construct() {
        $this->jsonFormat = new JsonFormat ();
        if (isset ( $_GET ['callback'] )) {
            self::$functionName = $_GET ['callback'];
        }
    }
    public function getMIMEMap() {
        return array (self::EXTENSION => self::MIME );
    }
    public function getMIME() {
        return self::MIME;
    }
    public function getExtension() {
        return self::EXTENSION;
    }
    public function encode($data, $human_readable = FALSE) {
        return self::$functionName . '(' . $this->jsonFormat->encode ( $data, $human_readable ) . ');';
    }
    public function decode($data) {
        return $this->jsonFormat->decode ( $data );
    }
    public function setMIME($mime) {
        //do nothing
    }
    public function setExtension($extension) {
        //do nothing
    }
}