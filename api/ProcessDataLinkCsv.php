<?php
class ProcessDataLinkCsv 
{
    
    public function import($filePath){
        $csv = new CSVFile($filePath);

        $allResults = array();

        foreach ($csv as $line)
        {
            $result = array();
        
            $result['bsLevel'] =$line['BG Reading (mg/dL)'];
            $result['insulinAmount'] = $line['Bolus Volume Delivered (U)'];
            $result['resultDate'] =$line['Timestamp'];
            $result['labels'] = 'imported result';
            
            $allResults[] = $result;
            
            var_dump($line);
        }
        
        echo json_encode($allResults);
        
    }
    
    public function export($userId){
        
    }
}
?>