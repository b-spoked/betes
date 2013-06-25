/**
 * Created by JetBrains PhpStorm.
 * User: Jamie
 * Date: 27/02/13
 * Time: 3:45 PM
 * To change this template use File | Settings | File Templates.
 */


        $(function(){
          new BBAssetsUpload({
            url: "http://betes-insights.herokuapp.com/uploads/diary",
            listElement: $("#upload-csv .images"),
            dropElement: $("#upload-csv .drop"),
            assetTemplate: $("#template-image").html(),
            assetUploadingTemplate: $("#template-image-uploading").html(),
            maxFileSize: 500,
            acceptFileTypes: "csv"
          });
        });

window.UploadView = Backbone.View
		.extend({

			  initialize : function (  ) {
				  _.bindAll(this);
					this.template = _.template($('#upload-template').html());
			  },
				render : function() {
					$(this.el).html(this.template());
					return this;
				}
		});