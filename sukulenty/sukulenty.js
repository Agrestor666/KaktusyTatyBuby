             var lastSlashPos = document.URL.lastIndexOf("/") > document.URL.lastIndexOf("\\") ? document.URL.lastIndexOf("/") : document.URL.lastIndexOf("\\");
           if( document.URL.substring(lastSlashPos + 1, lastSlashPos + 4).toLowerCase() != "~hh" )
	   $(document).ready(function(){
		   $(window).bind('resize', function() {
				var y = $('#header').height();
				$('#content').css('margin-top', y);
				$('.hmanchor').css('margin-top', -y-20);
				$('.hmanchor').css('padding-top', y+20);
			});
		   $(window).triggerHandler('resize');	
		   $(window).triggerHandler('resize');	
                   
		});