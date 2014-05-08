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
  // annotator should be in format { email: 'foo@example.com', name: 'Foo Annotator' }
  // any custom fields would require a URI to an RDF vocabulary
  this.annotatedBy = options.annotator
}

Annotator.prototype.createAnnotation = function (body, callback) {
    
  var newAnnotation = {
    target: {
      uri: targetDocument,
      type: targetType
    }
    body: {
      // expected URI or plain text
      // if plain text, uuid is necessary
      bodyData: body,
      annotatedAt: new Date,
      annotatedBy: this.annotatedBy,
      serializedBy: 'https://github.com/ritchiea/foster',
      serializedAt: new Date
    }
  }

  this.annotations.push(newAnnotation)

  return newAnnotation
}

Reader = function(options) {

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
  
    event.preventDefault()
    event.stopPropagation()

    var dropped = event.srcElement
    // data could come from the source or a HTML data attribute
    writer.createAnnotation(dropped)
      
  })
}

Annotateable.prototype.getAnnotations = function() {
  return this.writer.annotations
}

window.Foster = Annotateable

  )();
