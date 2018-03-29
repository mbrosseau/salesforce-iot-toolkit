({
    onCometdLoaded : function(component, event, helper) {
     //   console.log("Loading Cometd");
        var cometd = new org.cometd.CometD();
        component.set('v.cometd', cometd);
        if (component.get('v.sessionId') != null)
            helper.connectCometd(component);
    },
    
    
    onInit : function(component, event, helper) {
        console.log("Loading Cometd..");
        component.set('v.cometdSubscriptions', []);
      //  component.set('v.notifications', []);
        // Disconnect CometD when leaving page
        window.addEventListener('unload', function(event) {
            helper.disconnectCometd(component);
        });
        
        // Retrieve session id
        var action = component.get('c.getSessionId');
        action.setCallback(this, function(response) {
            if (component.isValid() && response.getState() === 'SUCCESS') {
                component.set('v.sessionId', response.getReturnValue());
                if (component.get('v.cometd') != null)
                    helper.connectCometd(component);
            }
            else
                console.error(response);
        });
        
        $A.enqueueAction(action);
                 
       // helper.displayToast(component, 'success', 'Ready to receive notifications.');
        
       
    },
     onInitChart : function(component, event, helper) {
         
       //   console.log("Loading onInitChart  ...");
   
          var eventName =   component.get("v.eventName");
         if(eventName == null) {return;}
 		if(!eventName.includes("__e")) {
              //  console.log("event name (" + eventName + ") does not include __e");
                helper.displayToast(component, "error", "event name (" + eventName + ")  should be the API name (including '__e')");
            return;
        }
         
         helper.loadChart(component, event, helper);
         helper.loadFieldsAndData(component, event, helper);
       
    },
    
    
      onChangeFieldName : function(component, event, helper) {
         // console.log("On Change Field");
         helper.loadChart(component, event, helper);
                  
	      var defaultField = helper.getSelectedField(component, helper);
          
         helper.getChartData(component, helper, defaultField);

    }
})