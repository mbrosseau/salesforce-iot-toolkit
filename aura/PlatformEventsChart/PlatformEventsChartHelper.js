({
    connectCometd : function(component) {
        var helper = this;
        
        // Configure CometD
        var cometdUrl = window.location.protocol+'//'+window.location.hostname+'/cometd/40.0/';
        var cometd = component.get('v.cometd');
        cometd.configure({
            url: cometdUrl,
            requestHeaders: { Authorization: 'OAuth '+ component.get('v.sessionId')},
            appendMessageTypeToURL : false
        });
        cometd.websocketEnabled = false;
        
        // Establish CometD connection
      //  console.log('Connecting to CometD: '+ cometdUrl);
        cometd.handshake(function(handshakeReply) {
            if (handshakeReply.successful) {
                console.log('Connected to CometD. Now subscribing.');
                
                // Subscribe to platform event   
                var newSubscription = cometd.subscribe( '/event/' + component.get("v.eventName"),
                                                       function(platformEvent) {
                                                           console.log('Platform event received: '+ JSON.stringify(platformEvent));
                                                           helper.onReceiveNotification(component, platformEvent);
                                                       }
                                                      );
                // Save subscription for later
                var subscriptions = component.get('v.cometdSubscriptions');
                subscriptions.push(newSubscription);
                component.set('v.cometdSubscriptions', subscriptions);
            }
            else {
                console.error('Failed to connected to CometD.');
                 helper.displayToast(component, "error", "Failed to connected to CometD.");
            }
        });
    },
    
    disconnectCometd : function(component) {
        var cometd = component.get('v.cometd');
        
        // Unsuscribe all CometD subscriptions
        cometd.batch(function() {
            var subscriptions = component.get('v.cometdSubscriptions');
            subscriptions.forEach(function (subscription) {
                cometd.unsubscribe(subscription);
            });
        });
        component.set('v.cometdSubscriptions', []);
        
        // Disconnect CometD
        cometd.disconnect();
        console.log('CometD disconnected.');
    },
    
   onReceiveNotification : function(component, platformEvent) {
        
        var helper = this;
        
      //  console.log("Chart received IOT Data");
       // console.log(platformEvent.data);
 		/*var selectItem = document.getElementById("selectField");
        var fieldName = selectItem.options[selectItem.selectedIndex].value;
 		
        var fieldList =  component.get('v.objectDefs');
       // console.log(fieldList);
        var devName = '';
        for(var i=0; i<fieldList.length; i++) {
            if(fieldList[i].Label == fieldName) {
                devName = fieldList[i].DeveloperName; 
            }
        }
        */
       
       var deviceIdField = component.get("v.deviceId");
        var recordId = component.get("v.recordId");
       //console.log("deviceIdField " + deviceIdField);
       //  console.log(platformEvent.data.payload);
       if(deviceIdField != null && deviceIdField.length > 0) {
           var itemId = platformEvent.data.payload[deviceIdField];
         //  console.log("Filtering data if event id does not match current record:" + itemId + " recordId " + recordId);
           if(itemId != recordId) {
               return;
           }
       }
       
       var devName = helper.getSelectedField(component, helper);
       // devName = devName + "__c";
        
       
       
// console.log(devName);
        
     //   console.log(platformEvent.data.payload);
      //  console.log(platformEvent.data.payload[devName]); 
      //  console.log(platformEvent.data.payload.CreatedDate);
        
        var newNotification = {
            x : platformEvent.data.payload.CreatedDate,
            y : platformEvent.data.payload[devName]
        };
        
     
        if(window.myChart == null) {return};
        var chart = window.myChart;
        
    //  chart.data.labels.push(platformEvent.data.payload.CreatedDate);
        
        chart.data.datasets[0].data.push(newNotification);
        chart.update();
       
        
    },
    
    displayToast : function(component, type, message) {
        
       console.log(message);
            $A.createComponents([
                ["ui:message",{ "title" : "Error",  "severity" : type, }],
                ["ui:outputText",{ "value" : message}]
                ],
                function(components, status, errorMessage){
                    if (status === "SUCCESS") {
                        var message = components[0];
                        var outputText = components[1];
                        // set the body of the ui:message to be the ui:outputText
                        message.set("v.body", outputText);
                        var div1 = component.find("msgDiv");
                        // Replace div body with the dynamic component
                        div1.set("v.body", message);
                    }
                    else if (status === "INCOMPLETE") {
                        console.log("No response from server or client is offline.")
                        // Show offline error
                    }
                    else if (status === "ERROR") {
                        console.log("Error: " + errorMessage);
                        // Show error message
                    }
                }
            );
        
    },
    
    loadChart : function(component, event, helper) {
       
        var canvas = document.getElementById("myChart");
        
        if(canvas == null) {
            console.log("--------- IOT Chart Canvas Missing ----------");
            return;
        }
        
        var ctx =  canvas.getContext('2d');  
        var timeFormat = 'YYYY-MM-DD hh:mm:ss';
	    var date = Date.now();
 		var labels = [];
        var data2 = [];

        var config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Event Data",
                    data: data2,   
                    type: 'line',
                    fill: true,
                    backgroundColor: [
                        'rgba(15, 8, 200, 0.4)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                elements: {
					line: {
						tension: 0.001
					}
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'series',
                        ticks: {
                            source: 'labels'
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Val'
                        }
                    }]
                }
            }
        };
         
           window.myChart = new Chart(ctx, config);  
        
        //  config.update();
        
      },
     loadFieldsAndData : function(component, event, helper) {
            var action2 = component.get("c.getEventFields");
		action2.setParams({
        	eventName : component.get("v.eventName")
    	});

    	action2.setCallback(this, function(a) {
            if (a.getState() === "SUCCESS") {
              // console.log("Loaded Event Object Fields");
              // console.log(a.getReturnValue());
                var fieldsNames = a.getReturnValue();
                component.set("v.objectDefs", fieldsNames);

			                
               var labelList = [];
                for(var i =0; i<fieldsNames.length; i++ ) {
                    labelList[i] = fieldsNames[i].Label;
                }
                 component.set("v.objectFields", labelList);
                if(fieldsNames.length > 0) {
                  //  var defaultField = fieldsNames[0].DeveloperName;
                    var defaultField = fieldsNames[0].QualifiedApiName;
                 //   console.log("Default Field " + defaultField);
                    helper.getChartData(component, helper, defaultField);
                }
              
            } else if (a.getState() === "ERROR") {
                 console.log("Loading Event Object Fields Failed! ");
               // console.log(a.getError());
                $A.log("Errors", a.getError());
                 helper.displayToast(component, "error", "Loading Event Object Fields Failed! " + a.getError());
            }
   		});

    	$A.enqueueAction(action2);
         
     },
    
    getChartData : function(component, helper, fieldName) {
        
       // console.log("Getting chart data for " + fieldName);
       // component.set("v.chartField", fieldName);  
        
        var objName = component.get("v.objectName");
        if(objName == null || objName.length == 0) {
            return;
        }
        
       // fieldName = fieldName + '__c';
        
        var action = component.get("c.getEventData");
        action.setParams({
            fieldName: fieldName,
            objectName : objName,
            recordId : component.get("v.recordId")
        });
        
        action.setCallback(this, function(a) {
            if (a.getState() === "SUCCESS") {
              //  console.log("Loaded Chart Data");
                // console.log("Field Name " + fieldName);
                helper.renderData(component, helper, a.getReturnValue());
                
            } else if (a.getState() === "ERROR") {
                console.log("Loading Chart Data Failed! ");
                //console.log(a.getError());
                $A.log("Errors", a.getError());
                  helper.displayToast(component, "error", "Loading Chart Data Failed! " + a.getError());
            }
        });
        
        $A.enqueueAction(action);
    },
    
    renderData : function(component, helper, queryResult) {
        
      //  console.log("----------Rendering Data ------------");
     
       /*    var selectItem = document.getElementById("selectField");
          var fieldName = selectItem.options[selectItem.selectedIndex].value;
        
        fieldName = fieldName + "__c"; */
        
        var fieldName = helper.getSelectedField(component, helper);
         //fieldName = fieldName + "__c";
       /* 
        console.log("-----Got Data -----");
        console.log(queryResult);
        console.log("For Field Name - " + fieldName);
          */
        
        if(window.myChart == null) {return};
         
      //  console.log(window.myChart);        
        var chart = window.myChart;

        for(var i=0; i<queryResult.length; i++) {
             if(queryResult[i][fieldName] != null) {
                var newNotification = {
                    x : queryResult[i].CreatedDate,
                    y :queryResult[i][fieldName]
                };
                 
              //  chart.data.labels.push(queryResult[i].CreatedDate);
           
        		chart.data.datasets[0].data.push(newNotification);
            }
        }
           chart.update();
        
    }, 
    getSelectedField : function(component, helper) {
          var selectItem = document.getElementById("selectField");
          var fieldName = selectItem.options[selectItem.selectedIndex].value;
  
          var fieldList = component.get("v.objectDefs");
	      var defaultField = '';
			                
              
           for(var i =0; i<fieldList.length; i++ ) {
                    
             if(fieldList[i].Label == fieldName) {
               defaultField = fieldList[i].QualifiedApiName;
             }
           }
           
        return defaultField;
        
    }
    
})