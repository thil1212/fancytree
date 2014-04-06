

var selectedNode = null;
var maxLevel = 4;
 var flag = false;
 
$(document).ready(function() {
	var folderLevel =  $('#folderLevel').val();
	
	if(folderLevel != null && typeof(folderLevel) != 'undefined'){
		maxLevel = parseInt(folderLevel);
		
	}
	
	$(document).keydown(function(event) {
        if (event.which == 17) {
            flag = true
        }

    })

    $(document).keyup(function(event) {
        if (event.which == 17) {
            flag = false
        }

    })
    
    

	
	
  $('#left-content-tree-view').fancytree({
	  disableNavButtons : true,
    extensions: ['contextMenu','dnd'],
	  dnd: {
      preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
      preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
      autoExpandMS: 400,
      dragStart: function(node, data) {
        /** This function MUST be defined to enable dragging for the tree.
         *  Return false to cancel dragging of node.
         */
        return true;
      },
      dragEnter: function(node, data) {
        /** data.otherNode may be null for non-fancytree droppables.
         *  Return false to disallow dropping on node. In this case
         *  dragOver and dragLeave are not called.
         *  Return 'over', 'before, or 'after' to force a hitMode.
         *  Return ['before', 'after'] to restrict available hitModes.
         *  Any other return value will calc the hitMode from the cursor position.
         */
        // Prevent dropping a parent below another parent (only sort
        // nodes under the same parent)
    	  if(node.parent != null && typeof(node.parent) != 'undefined'){
    		  if(node.parent.key == "root_1" || node.parent.key == "root_2" || node.parent.key == "root_3"){
    			  return false;
    		  }
    	  }else{
    		  
    		  return false;
    	  }
    	  
    	  var nodeLevel = node.getLevel();
    	  if(!node.folder){
    		  nodeLevel = node.parent.getLevel();
    	  }
    	  var levelArray = getFromNodetoLeafNodeLevel(data.otherNode);
    	  
    	  var max = 0;
    	  $.each(levelArray,function(index,val){
    		  
    		  if(max < val){
    			  
    			  max = val;
    		  }
    		  
    	  })
    	 
    	  
    	  var targetLevel = data.otherNode.getLevel() - 1;
    	  var newLevel =  nodeLevel + (max - targetLevel);
    	  
    	  if(newLevel > maxLevel && data.otherNode.folder){
    		  
    		  if(node.folder){
    			  newLevel =  node.parent.getLevel() + (max - targetLevel);
    			  if(newLevel > maxLevel){
    				  return false;
    			  }else if(!presentInParentNode(node, data.otherNode)){
    				  return ['before', 'after'];
    			  }
    		  }
    		  
    		  return false;
    	  }
        // Don't allow dropping *over* a node (would create a child)
    	 // if( typeof($(node.li).find('span.fancytree-folder')) != 'undefined' && $(node.li).find('span.fancytree-folder').length >0 && typeof($(node.li).find('span.fancytree-ico-cf')) != 'undefined' && $(node.li).find('span.fancytree-ico-cf').length >0  ){
    	   if(node.folder){
  			//return ["over","before", "after"];
  			  if(!presentInChildNodes(node, data.otherNode) && !presentInParentNode(node, data.otherNode) ){
  				  return true;  
  			  }else if(!presentInChildNodes(node, data.otherNode)){
  				  
  				  return ['over'];
  			  }else if(!presentInParentNode(node, data.otherNode)){
  	    		  return ['before', 'after'];
  	    	  }else{
  	    		  
  	    		  return false;
  	    	  }
  			
          }else{
          	
          	if(!presentInParentNode(node, data.otherNode)){
        		  return ['before', 'after'];
        	  }else{
        		  
        		  return false;
        	  }
  		    // return ["before", "after"];

  		  }                 
    	},
      dragDrop: function(node, data) {
        /** This function MUST be defined to enable dropping of items on
         *  the tree.
         */
    	  
        data.otherNode.moveTo(node, data.hitMode);
        var params = [];
        params = getFolderPath(data.otherNode,"content");
        
        //below line need to uncomment when you want to update to backend.
         
  	  	//updateNodeFolderPath(params);
  	  	
       
      }
    },
    source: {
      url: 'ajax-tree-local.json'
    },
	   activate: function(e, data) {
		   
		   if(selectedNodeId != 0 && selectedNodeId != data.node.key ){
		    	$('#getInpt')[0].blur();
		    }
			
		    
	     selectedNode =  data.node;
	   },
    contextMenu: {
      menu: {
        
		  'new' :{'name':'New'},
		  'refresh': { 'name': 'Refresh'},
		  'edit': { 'name': 'Edit', 'icon': 'edit' },
		  'delete': { 'name': 'Delete', 'icon': 'delete'},
		  'cut': { 'name': 'Cut', 'icon': 'cut'},
		  'paste': { 'name': 'Paste', 'icon': 'paste'}
		  
      }, 
	
      select: function(event, ui) {
				var node = $.ui.fancytree.getNode(ui.target);
				//alert("select " + ui.cmd + " on " + node);
				if( typeof($(node.li).find('span.fancytree-folder')) != 'undefined' && $(node.li).find('span.fancytree-folder').length >0  ){
				}else{
				   return false;
				}
				
			},
   	actions: function(node, action, options) {
		  
		  // alert($(node.li).find('span.fancytree-folder').length);
			switch(action){
			
			  case 'new':
						//var node = $("#left-content-tree-view").fancytree("getActiveNode");
						//var obj =  { title: "New Folder", folder: true};
						//node.addChildren(obj);
				  		node.setActive();
						node.setExpanded(true);
						createNode(node,'content');
					 break;
			  case 'refresh':
				    node.setActive();
					//var node = $("#left-content-tree-view").fancytree("getActiveNode");
					var selectedId = parseInt(node.key.split('-')[1]);
					sortRecords(node,"#left-content-tree-view");
				      
				 break;
			
			  case 'edit':
				    node.setActive();
			        editEvents(node, "content"); break;
			  case 'cut':
				    node.setActive();
				  	customCutNodes('content',node);
				    break;
			  case 'paste':
				  //var node = $("#left-content-tree-view").fancytree("getActiveNode");
				  node.setActive();
				  customPastNodes(node,'content',"#left-content-tree-view");
				    break;      
			  case 'delete' :
					if(isfileExist(node)){
					   $( "#dialog-warning" ).dialog({
						modal: true,
						buttons: {
							Ok: function() {
								$( this ).dialog( "close" );
								}
							}
						});
					}else{
					
					   $( "#dialog-delete" ).dialog({
						modal: true,
						buttons: {
							Ok: function() {
								    //below code need to uncomment when you want to uncomment.
									//deleteFolder(node);
									node.remove(); 
									$( this ).dialog( "close" );
								
								},
							Cancel: function(){
									$( this ).dialog( "close" );
									}
								}
									
						});
					}
				    break;
			
			}
		  
      }
    }
  });
  
  
  function getNodeLevel(node){
	   var level = 0;
	  
	  if(node.key == 1){
		  return level
	  }else{
		  level++;
		  level = level + getNodeLevel(node.parent);
		 return level;
	  }
  }

  
   

  
  function compare(a,b) {
	   if (a.title < b.title)
	      return -1;
	   if (a.title > b.title)
	     return 1;
	   return 0;
   }

  
  
  

  $.contextMenu({
        selector: ".fancytree-ico-c", 
        delay: 500,
        callback: function(key, options) {
        	var node = $(this).parent()[0].ftnode;
        	node.setActive();
        	customCutNodes(node.data.type, node);
        },
        items: {
            "cut": {name: "Cut", icon: "cut"}
        }
    });
  
 
  
  });

var tree_node_stack = [];
var user_actions = [];


function getFromNodetoLeafNodeLevel(node){
	var params = [];
	
	var tmpArray = [];
	
	if(node.children != null && node.children.length > 0){
		$.each(node.children, function(index,childObj){
		//alert(childObj.title);
		
		//obj['folderParent'] = parseInt(childObj.parent.key.split('-')[1]);
		if( childObj.folder){
			//var obj = {};
		//obj[childObj.key] = childObj.getLevel();
			params.push(childObj.getLevel());	
		
		
		
		if( childObj.children != null && childObj.children.length > 0){
			tmpArray = getFromNodetoLeafNodeLevel(childObj);
		}
		
		}
		if(tmpArray.length > 0){
			
			$.each(tmpArray,function(index,value){
				
				params.push(value);
			})
		}
		
		})
	}
	
	
	
	//var obj = {};
	//obj.folderParent = parseInt(node.parent.key.split('-')[1]);
	if( node.folder){
		//obj[node.key] = node.getLevel();
		params.push(node.getLevel());	
	}
	
	
	return params;

}

function dropAllnodes(node,type,id,hitMode){
	
	/* $.each(tree_node_stack,function(index,obj){
		  $(obj.li).css('background',''); 
	  })*/
	var ispresent = false;
	var params = [];
	var tmp = [];
	
	if(!node.folder){
		
		node = node.parent;
	}
	    if(tree_node_stack.length > 0){
	    removeDuplicateNodes(tree_node_stack);
		$.each(tree_node_stack,function(index,obj){
	    	var tmpNode = $(id).fancytree("getTree").getNodeByKey(obj.key);
	    	var max = 0;
	    	var newLevel = 0;
	    	
	    	  if(obj.folder){
	    	  var levelArray = getFromNodetoLeafNodeLevel(tmpNode);
	    	  $.each(levelArray,function(index,val){
	    		  
	    		  if(max < val){
	    			  
	    			  max = val;
	    		  }
	    		  
	    	  })
	    	  var targetLevel = tmpNode.getLevel() - 1;
	    	   newLevel = node.getLevel() + (max - targetLevel);
	    	  
	    	 }
	    	 
	    	  // max level constrains default 4.
	    	  if(newLevel <= maxLevel || !obj.folder){
	    		
	    	    var child = {
	  	    			
	    		     'title':obj.title,
	    	 	      'key':obj.key,
	    	 		  'folder':obj.folder,
	    	 		  'children':obj.children,
	    	 		  'type':obj.data.type
	    		   }
	    		    	
	    	     // unquie name constrains .
	    	     if(!presentInChildNodes(node, obj)){
	    		    tmpNode.remove();
	    		    node.addChildren(child);
	    		    tmpNode = $(id).fancytree("getTree").getNodeByKey(obj.key);
	    		   // tmp =  getFolderPath(tmpNode,type);
	    		    
	    		    if(tmp != null && tmp.length > 0){
	    		    	
	    		    	$.each(tmp,function(innerIndex,val){
	    		    		params.push(val);
	    		    	})
	    		    }
	    		    
	    	     }else{
	    	    	// $(obj.li).css('opacity','1');
	    	     }
	    		  
	    	  }else{
	    		  
	    		 // $(obj.li).css('opacity','1');
	    	  }  
	    	  	
	    	
	    })
	   }
	
}

function customCutNodes(type,node){
	
	
	if(node.key == 'f-1'){
		return true;
	}
	
	if(tree_node_stack.length > 0){
		
		
		if(tree_node_stack[0].data.type != node.data.type){
			
			$.each(tree_node_stack,function(index,obj){
				  $(obj.li).css('background',''); 
			  })
			  
			  tree_node_stack = [];	
			  $(node.li).css('background','#B6E6FB');
			  tree_node_stack.push(node);
		}else{
		
	    var isSelectedNode = false;
		$.each(tree_node_stack, function(index,tmpNode){
			
			if(tmpNode.key == node.key){
				
				isSelectedNode = true;
			}
		})
		
		if(!isSelectedNode){
			$.each(tree_node_stack,function(index,obj){
				  $(obj.li).css('background',''); 
			  })
			  
			  tree_node_stack = [];
			  $(node.li).css('background','#B6E6FB');
			  tree_node_stack.push(node);
			
		}
	 }
		
	}else{
		$(node.li).css('background','#B6E6FB');
		tree_node_stack.push(node);
	}
  
	
	 $.each(tree_node_stack,function(index,obj){
		  $(obj.li).css('background',''); 
	  })
	  removeDuplicateNodes(tree_node_stack);
	 
	 
	  var actions = {
			  'type' :type,
			  'nodes' :tree_node_stack
		  }
	  
	  if(user_actions.length > 0){
		  $.each(user_actions[0].nodes,function(index,obj){
				$(obj.li).css('opacity','1');
			})
			
			user_actions = [];
	  }
	  user_actions.push(actions);
	  $.each(tree_node_stack,function(index,obj){
		 
		  $(obj.li).css('opacity','0.5');
	  })
	
	
	
}


function customPastNodes(node,type,id){
	
	var ispresent = false;
	var params = [];
	var tmp = [];
	var missed_items_name =  []; 
	if(user_actions.length > 0){
		
		$.each(user_actions[0].nodes,function(index,obj){
			
		/*	if(jthNodeContainsIthnode(node,obj)){
			    	
				ispresent = true
			}
		*/	
			if(obj.key == node.key){
				ispresent = true;
			}
			
			if(jthNodeContainsIthnode(obj,node)){
		    	
				ispresent = true;
			}
		})
		
		if(!ispresent){
		
		$.each(user_actions[0].nodes,function(index,obj){
	    	var tmpNode = $(id).fancytree("getTree").getNodeByKey(obj.key);
	    	var max = 0;
	    	var newLevel = 0;
	    	
	    	  if(obj.folder){
	    	  var levelArray = getFromNodetoLeafNodeLevel(tmpNode);
	    	  $.each(levelArray,function(index,val){
	    		  
	    		  if(max < val){
	    			  
	    			  max = val;
	    		  }
	    		  
	    	  })
	    	  var targetLevel = tmpNode.getLevel() - 1;
	    	   newLevel = node.getLevel() + (max - targetLevel);
	    	  
	    	 }
	    	 
	    	  // max level constrains default 4.
	    	  if(newLevel <= maxLevel || !obj.folder){
	    		
	    	    var child = {
	  	    			
	    		     'title':obj.title,
	    	 	      'key':obj.key,
	    	 		  'folder':obj.folder,
	    	 		  'children':obj.children,
	    	 		  'type':obj.data.type
	    		   }
	    		    	
	    	     // unquie name constrains .
	    	     if(!presentInChildNodes(node, obj)){
	    		    tmpNode.remove();
	    		    node.addChildren(child);
	    		    tmpNode = $(id).fancytree("getTree").getNodeByKey(obj.key);
	    		    tmp =  getFolderPath(tmpNode,type);
	    		    
	    		    if(tmp != null && tmp.length > 0){
	    		    	
	    		    	$.each(tmp,function(innerIndex,val){
	    		    		params.push(val);
	    		    	})
	    		    }
	    		    
	    	     }else{
	    	    	 missed_items_name.push(obj.title);
	    	    	 $(obj.li).css('opacity','1');
	    	     }
	    		  
	    	  }else{
	    		  missed_items_name.push(obj.title);
	    		  $(obj.li).css('opacity','1');
	    	  }  
	    	  	
	    	
	    })
	    
		}else{
			
			$.each(user_actions[0].nodes,function(index,obj){
				$(obj.li).css('opacity','1');
			})
			
			user_actions = [];
		}
	}    
	
	if(params != null && params.length > 0){
		
		//below line need to uncomment when you want to update to back end.
		//updateNodeFolderPath(params);
	}
	
	if(missed_items_name != null && typeof(missed_items_name) != 'undefined' && missed_items_name.length > 0){
		
		$( "#operation-notifications" ).dialog({
			modal: true,
			open:function(event, ui){
				$(this).find('#operations-details').empty();
				$(this).find('#operations-details').append("<p> Sorry! Unable to move <b>"+missed_items_name.join(',')+"</b>  folder due to maximum folder levels or duplicate folder names violations.</p>");
			},
			buttons: {
				Ok: function() {
					   $(this).find('#operations-details').empty(); 
						$( this ).dialog( "close" );
						
					
					}
				
					}
						
			});
		
		missed_items_name = [];
		
	}
	
	   // tree_node_stack = [];
	    user_actions = [];
	
	
} 

function removeDuplicateNodes(nodes){
	
	var tmp = [];
	try{
	for(var i=0;i<nodes.length;i++){
		var ispresent = false;
		for(j=0;j<nodes.length;j++){
			
			if(i != j){
			    if(jthNodeContainsIthnode(nodes[j],nodes[i])){
			    	ispresent = true;
			    }
			}
			
		}
		
		if(!ispresent){
			tmp.push(nodes[i]);
		}
	}
	
	tree_node_stack = tmp;
	}catch(e){
		
		//alert(e)
	}
}

function jthNodeContainsIthnode(jNode,iNode){
	
	var ispresent = false;
	
	
	if(jNode.key == iNode.key){
		ispresent = true;
		
		return ispresent;
	}
	
	if(jNode.folder){
	
	if(jNode.children != null && jNode.children.length > 0 ){
		$.each(jNode.children,function(index,child){
		   
			if(jthNodeContainsIthnode(child,iNode)){
				ispresent = true;
				return ispresent;
			}
		
		})
	 }
	
	}
	
	
	return ispresent;
	
}

function mutipleSelection(){
	
	$('li').delegate('span.fancytree-node','click',function(event){
		  
		  if(flag){
			  
			  $(this).parent().css('background','#B6E6FB');
			  tree_node_stack.push(this);
		  }else{
			  
			  if(tree_node_stack.length > 0){
				  
				  $.each(tree_node_stack,function(index,UIObj){
					  
					  $(UIObj).parent().css('background','');
					  
				  })
				  tree_node_stack = [];
				  $(this).parent().css('background','#B6E6FB');
				  tree_node_stack.push(this);
				  
			  }
		  }
	  })
}

function sortRecords(node, treeId){
    var cmp = function(a, b) {
        a = a.title.toLowerCase();
        b = b.title.toLowerCase();
        return a > b ? 1 : a < b ? -1 : 0;
      };

      node.sortChildren(cmp, false);
  
      var childs = [];
      var newChilds = []
     if(node.children != null && node.children.length > 1){ 
      $.each(node.children,function(index,obj){
    	  
    	  if(typeof(obj) != 'undefined' && !obj.folder){
    		  childs.push(obj);
    		  
    		  var newOBj = {
    				  'title':obj.title,
    				  'key':obj.key,
    				  'folder':obj.folder,
    				  'children':obj.children,
    				  'type':obj.data.type
    		  }
    		  newChilds.push(newOBj);
    	  }
      })
      
      $.each(childs,function(index,obj){
    	  var tmpNode = $(treeId).fancytree("getTree").getNodeByKey(obj.key);
    	  tmpNode.remove();
      })
      
      $.each(newChilds,function(index,obj){
    	 node.addChildren(obj); 
      })
      
      node.setExpanded(true);
     }
      
      if(user_actions.length > 0){
    	  $.each(user_actions[0].nodes,function(index,obj){
			$(obj.li).css('opacity','1');
    	  })
      }	
		user_actions = [];
}




function changeFoldersKey(node){
	
	if(node.folder){
		node.key = 'f-'+node.key;
	}
	
	if(node.children != null && node.children.length > 0){
		$.each(node.children, function(index,childObj){
			if( childObj.folder){
				changeFoldersKey(childObj);
			}
		})
	}
	
}

function getparentNode(node,typeValue){
	//data.otherNode.children
	
	var params = [];
	
	var tmpArray = [];
	//console.log("inside --->"+node.title + " childlenght ===>"+node.children)
	if(node.children != null && node.children.length > 0){
		
		$.each(node.children, function(index,childObj){
		//alert(childObj.title);
		var obj = {};
		obj['folderParent'] = parseInt(childObj.parent.key.split('-')[1]);
		if( childObj.folder){
			//obj['folderPath'] = folderPath +data.otherNode.title+'/';
			obj['key'] = parseInt(childObj.key.split('-')[1]);
		}else{
			
			obj['folderPath'] = parentNodeTitle(childObj.parent,"");
			obj['key'] = childObj.key;
			obj['folder'] = childObj.folder;
			obj['type'] = typeValue;
			params.push(obj);
			
			
		}
		
		
		if(childObj.folder ){
			
			tmpArray = getparentNode(childObj,typeValue);
			
			if(tmpArray.length > 0){
				
				$.each(tmpArray,function(index,value){
					
					//console.log("title==========+++>"+value.key)
					params.push(value);
				})
			}
		}
		})
	}
	
	
	
	var obj = {};
	
	if( node.folder){
		obj.key = parseInt(node.key.split('-')[1]);
	}else{
		obj.folderPath = parentNodeTitle(node.parent,"");
		obj.key = node.key;
	}
	
	if(obj.key == 1){
		obj.folderParent = 0;
	}else{
		obj.folderParent = parseInt(node.parent.key.split('-')[1]);
	}
	
	obj.folder = node.folder; 
	obj.type = typeValue;
	params.push(obj);
	
	return params;
}



function getFolderPath(node,typeValue){
	//data.otherNode.children
	
	var params = [];
	
	var tmpArray = [];
	//console.log("inside --->"+node.title + " childlenght ===>"+node.children)
	if(node.children != null && node.children.length > 0){
		
		$.each(node.children, function(index,childObj){
		//alert(childObj.title);
		var obj = {};
		obj['folderParent'] = parseInt(childObj.parent.key.split('-')[1]);
		if( childObj.folder){
		/*	//obj['folderPath'] = folderPath +data.otherNode.title+'/';
			obj['key'] = parseInt(childObj.key.split('-')[1]);
			
			obj['folderPath'] = parentNodeTitle(childObj,"");
		
			obj['folder'] = childObj.folder;
			obj['type'] = typeValue;
			params.push(obj);
		*/	
			tmpArray = getFolderPath(childObj,typeValue);
			
			if(tmpArray.length > 0){
				
				$.each(tmpArray,function(index,value){
					
					//console.log("title==========+++>"+value.key)
					params.push(value);
				})
			}
		}
		})
	}
	
	
	
	var obj = {};
	
	if( node.folder){
		obj.key = parseInt(node.key.split('-')[1]);
		obj.folderPath = parentNodeTitle(node,"");
	}else{
		obj.key = parseInt(node.key);
		obj.folderPath = parentNodeTitle(node.parent,"");
	}
	
	if(obj.key == 1){
		obj.folderParent = 0;
	}else{
		obj.folderParent = parseInt(node.parent.key.split('-')[1]);
	}
	
	obj.folder = node.folder; 
	obj.type = typeValue;
	params.push(obj);
	
	return params;
}



function getchidsFolderdetails(node){
	//data.otherNode.children
	
	var params = [];
	
	var tmpArray = [];
	//console.log("inside --->"+node.title + " childlenght ===>"+node.children)
	if(node.children != null && node.children.length > 0){
		
		$.each(node.children, function(index,childObj){
		//alert(childObj.title);
		if( childObj.folder){
			tmpArray = getFolderPath(childObj);
			
			if(tmpArray.length > 0){
				
				$.each(tmpArray,function(index,value){
					
					params.push(value);
				})
			}
		}
		})
	}
	
	
	
	var obj = {};
	
	if( node.folder){
		obj.key = parseInt(node.key.split('-')[1]);
		//obj.folderPath = parentNodeTitle(node,"");
		obj.title = node.title
	}
	
	if(obj.key == 1){
		obj.folderParent = 0;
	}else{
		obj.folderParent = parseInt(node.parent.key.split('-')[1]);
	}
	
	obj.folder = node.folder; 
	params.push(obj);
	return params;
}

function parentNodeTitle(node, resultString){
	
	
	if(node.key.split('-')[1] == "1"){
		
		resultString =  node.title +'/'+resultString 
	}else{
		
		resultString =  parentNodeTitle(node.parent,resultString)+node.title +'/'+  resultString;
		
	}
	
	return resultString;
}


function updateNodeParentDetails(paramValue){
 	$.ajax({
		    url: 'folder/parent/update',
		    type: 'POST',
		    data: JSON.stringify(paramValue),
		    contentType: "application/json",
		    success: function(response){
		    	
		    }
		     
		    });

	}


function updateNodeFolderPath(paramValue){
 	$.ajax({
		    url: 'folder/path/update',
		    type: 'POST',
		    data: JSON.stringify(paramValue),
		    contentType: "application/json",
		    success: function(response){
		    	
		    }
		     
		    });

	}



function createNode(parentNode, folderType){
	
   
	var level =  parentNode.getLevel();
	
	if(level < maxLevel){
	
	var params = {};
	   params['title'] = 'New Folder';
	   params['type'] = folderType;
	   params['folderParent'] = parseInt(parentNode.key.split('-')[1]);
	   params['folder'] = true;

   // below your ajax call to update back end.
   
	/*
	$.ajax({
			url: 'folders/new',
			type: 'POST',
			data : params,
			dataType: "json",
			success: function(response){
				//console.log(response[0].key)
				params['key'] = 'f-'+response[0].key;
				var newNode = parentNode.addChildren(params);
				newNode.setActive();
				editEvents(newNode,folderType);
			}
						   }); 
		*/
	
	  params['key'] = 'f-'+Math.floor((Math.random()*10000000000000000000)+1); ;
	  var newNode = parentNode.addChildren(params);
	  newNode.setActive();
	  editEvents(newNode,folderType);
	
	}else{
		
		$( "#folder-level-dialog" ).dialog({
			modal: true,
			buttons: {
				Ok: function() {
						$( this ).dialog( "close" );
					}
			   }
			});
		
		
	}
	
	
}

function updateFolder(id,name,node,folderType){
	 var params = {};
	   params['title'] = name;
	   params['key'] = parseInt(id);
	  
	$.ajax({
	    url: 'folders/update',
	    type: 'POST',
	    data : params,
	    dataType: "json",
	    success: function(response){
	    	//console.log(response[0].key)
	    	  var params = [];
	          if(node.key.split('-')[1] !="1" ){
	        	  params = getFolderPath(node,folderType);
	        	  updateNodeFolderPath(params);
	          }else{
	        	  var rootNode = $("#left-content-tree-view").fancytree("getRootNode");
	        	  rootNode.children[0].setTitle(name)
	        	  params = getFolderPath(rootNode.children[0],"content");
	        	  updateNodeFolderPath(params);
	        	  
	        	  
	        	  rootNode = $("#left-image-tree-view").fancytree("getRootNode");
	        	  rootNode.children[0].setTitle(name)
	        	  params = getFolderPath(rootNode.children[0],"images");
	        	  updateNodeFolderPath(params);
	        	  
	        	  
	        	  rootNode = $("#left-layout-tree-view").fancytree("getRootNode");
	        	  rootNode.children[0].setTitle(name)
	        	  params = getFolderPath(rootNode.children[0],"layouts");
	        	  updateNodeFolderPath(params);
	        	  
	       	   }
	          
	    	
	    }
	     
	    }); 
	
	
}


function deleteFolder(node){
	var params =  getchidsFolderdetails(node);
	$.ajax({
	    url: 'folders/delete',
	    type: 'POST',
	    data : JSON.stringify(params),
	    contentType: "application/json",
	    success: function(response){
	    	//console.log(response[0].key)
	    }
	     
	    }); 
	
	
}

var selectedNodeId = 0;
function editEvents(node,folderType){
	
	var node_id = node.key.split('-')[1];
	selectedNodeId = node.key;
	
	//var labelValue = $(node.tree.getActiveNode().li).find('span.fancytree-title')[0].innerHTML;
	var labelValue = node.title;
	
	var htmtxt = '<input id= "getInpt" type="text" value="'+labelValue+'" title="'+labelValue+'" >';
	$(node.li).find('span.fancytree-title')[0].innerHTML = htmtxt;
	
	var nodeInnerHTML = $(node.li).find('span.fancytree-title')[0].innerHTML;
	
	$('#getInpt').select();
	$('#getInpt').focus();
	//console.log($('#getInpt')[0].offsetTop);
	var previousNode = $(node.li).find('span.fancytree-title');
	
	var treeHolderDivId = '';
		treeHolderDivId = "#left-content-tree-view";
	
	$( treeHolderDivId).find('.fancytree-container').scrollTop( $('#getInpt')[0].offsetTop );
	
	$('#getInpt').blur(function(){
	  var labelTxt =  $(this).val();
      if(typeof(labelTxt) != 'undefined' && $.trim(labelTxt).length > 0 && uniqueName(node,labelTxt)){
    	  $(previousNode)[0].innerHTML = labelTxt;
    	  node.title = labelTxt;
    	  // below code is commented 
    	  //updateFolder(node_id,labelTxt,node,folderType);
    	  selectedNodeId = 0;
    	  $(this).remove();
      }else{
    	  //$(previousNode)[0].innerHTML = node.title;
    	  $( "#folder-dialog" ).dialog({
				modal: true,
				buttons: {
					Ok: function() {
							//editEvents(node,folderType); 
							$( this ).dialog( "close" );
							$('#getInpt').select();
							$('#getInpt').focus();
						
						}
					
						}
							
				});
    	   
      }
      
	  
	}).keydown(function(event){
		
		      
			if ( event.which == 13 ) {
				var labelTxt =  $(this).val();
				var title = $(this).attr('title');
				 if(typeof(labelTxt) != 'undefined' && $.trim(labelTxt).length > 0 && uniqueName(node,labelTxt)){
					 $(previousNode)[0].innerHTML = labelTxt;
					 node.title = labelTxt;
					 //updateFolder(node_id,labelTxt,node,folderType);
					 selectedNodeId = 0;
					 $(this).remove();
				 }else{
					 
					 //$(node.tree.getActiveNode().li).find('span.fancytree-title')[0].innerHTML = node.title;
					  $( "#folder-dialog" ).dialog({
							modal: true,
							buttons: {
								Ok: function() {
										//editEvents(node,folderType); 
										$( this ).dialog( "close" );
										$('#getInpt').select();
										$('#getInpt').focus();
									}
								
									}
										
							});
			    
					 
				 }
			    
	         }
	})
	
	
	
}


function isfileExist(node){
  var ispresent = false;
  if(node.children != null && node.children.length > 0){
	  
	  $.each(node.children,function(index,childObj){
		  
		  if(!childObj.folder){
			  ispresent = true;
		  }else{
			  
			  if(isfileExist(childObj)){
				  ispresent = true;
				  
			  }
		  }
		  
	  })
	  
  }
  return ispresent	
}

function uniqueName(node, newName){
	
	var ispresent = false;
	var parentNodes = node.parent
	if(parentNodes.children != null && parentNodes.children.length > 0){
		$.each(parentNodes.children,function(index,obj){
		
		if(obj.key != node.key){
			if($.trim(obj.title) == $.trim(newName)){
				ispresent = true;
			}
			
		}
		
		})
	}
	
	return !ispresent;
	
	
}





function presentInChildNodes(node,tempNode){
	
	var ispresent = false;
	var parentNodes = node.parent
	
	if(node.children != null && node.children.length > 0){
		$.each(node.children,function(index,obj){
		  if(tempNode.key != obj.key && obj.folder && tempNode.folder){
			if($.trim(obj.title) == $.trim(tempNode.title)){
				ispresent = true;
			}
		  }
		})
	}
	
	return ispresent;
}


function presentInParentNode(node,tempNode){
	
	var ispresent = false;
	var parentNodes = node.parent
	
		if(parentNodes.children != null && parentNodes.children.length > 0){
			$.each(parentNodes.children,function(index,obj){
				if(tempNode.key != obj.key && obj.folder && tempNode.folder){
				  if($.trim(obj.title) == $.trim(tempNode.title)){
					ispresent = true;
				  }
				}
			})
		}
	
	return ispresent;
}

function checkForUniqueName(node, newName,hitMode){
	
	var ispresent = false;
	var parentNodes = node.parent
	
	if(node.children != null && node.children.length > 0){
		$.each(node.children,function(index,obj){
			
			if($.trim(obj.title) == $.trim(newName)){
				ispresent = true;
			}
		
		})
	}
	
	if(hitMode == 'before' || hitMode == 'after'){
		if(parentNodes.children != null && parentNodes.children.length > 0){
			$.each(parentNodes.children,function(index,obj){
			
				if($.trim(obj.title) == $.trim(newName)){
					ispresent = true;
				}
		
			})
		}
	}
	
	return ispresent;
	
	
}

