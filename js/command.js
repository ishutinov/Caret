define([
    "util/text!config/commands.json",
    "util/dom2"
  ], function(list) {
    
    try {
      list = JSON.parse(list);
    } catch (e) {
      console.error(e);
      list = [];
    }

  /*
  
  The command module is the heart of Caret's loosely-coupled modules. It
  serves as an event bus for inter-module communication, but it also listens
  to the DOM for click/change events and makes it easy to bind page interactions
  to command callbacks.
  
  Command is usually called as if synchronous, but it does support asynchronous
  operation--it will pass a callback in to any subscribers, but will also
  immediately pass back the return value (if any) from the those subscribers.
  
  */
  
  var commands = {};
  
  //commands can pass a callback, although most don't respond that way
  var fire = function(command, argument, callback) {
    if (!commands[command]) return;
    var args = [].slice.call(arguments, 1);
    //technically, a function argument is a callback...
    if (typeof argument == "function") {
      callback = argument;
    }
    var registry = commands[command].slice();
    registry.forEach(function(entry) {
      var result = entry.callback.apply(null, args);
      //immediately call back if sync-style return value was provided
      if (typeof result !== "undefined" && callback) {
        callback.call(null, result);
      }
    });
  }
  
  var register = function(command, listener) {
    if (!commands[command]) {
      commands[command] = [];
    }
    commands[command].push({
      callback: listener
    });
  }
  
  //delegate for all elements that have a command attribute
  //may want to add more listeners for other UI elements (select)
  document.body.on("click", function(e) {
    //cancel on inputs, selectboxes
    if (["input", "select"].indexOf(e.target.tagName.toLowerCase()) >= 0) return;
    //delegate all items with a command attribute
    if (e.target.hasAttribute("command")) {
      var command = e.target.getAttribute("command");
      var arg = e.target.getAttribute("argument");
      fire(command, arg);
      e.preventDefault();
    }
  });
  
  document.body.on("change", function(e) {
    if (e.target.hasAttribute("command")) {
      var command = e.target.getAttribute("command");
      var arg = e.target.value;
      fire(command, arg);
    }
  });
  
  var facade = {
    fire: fire,
    on: register,
    list: list
  };
  
  return facade;

});