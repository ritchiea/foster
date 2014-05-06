(function Annotator(options){
  // annotations have a target, a body and a predicate
  // all of these will be URIs
  // if loaded into a web page, target is current url
  // else URI must be supplied

  if (typeof options === 'undefined') { options = {} }

  var TYPES = {
    dataset: 'dctypes:Dataset',
    image: 'dctypes:Image',
    movingImage: 'dctypes:MovingImage',
    text: 'dctypes:Text',
    sound: 'dctypes:Sound'
  }

  this.targetDocument = options.target || window.location.href
  this.targetType = options.targetType || TYPES.dataset
  this.annotations = options.source || []
}

Annotator.prototype.createAnnotation = function (body, callback) {
    
  // this needs to handle lots more fields
  var newAnnotation = {
    target: {targetDocument,
    targetType: targetType,
    body: body
    // body: body.body,
    // bodyType: body.type
  }

  this.annotations.push(newAnnotation)

  return newAnnotation
}

Annotateable = function(options) {

  if (typeof options === 'undefined') { var options = {} }
  if (typeof options === 'string') { 
    var selector = options 
    options = {}
  }

  this.writer = new Annotator(options)

  var selector = selector || options.selector
  var targetEl = document.getElementById(selector) || document.getElementByTagName('html')[0]

  targetEl.addEventListener('dragend', function (event){
  
    event.stopPropagation()
    event.preventDefault()

    var dropped = event.srcElement
    // data could come from the source or a HTML data attribute
    writer.createAnnotation(dropped, 'predicate') 
      
  })
}

Annotateable.prototype.getAnnotations = function() {
  return this.writer.annotations
}

window.Foster = Annotateable

)();
