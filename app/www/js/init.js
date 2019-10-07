(function($){

  var mnistAppData = null
  var mnistClasses = null
  var roadsignsAppData = null
  var roadsignsClasses = null

  var chart1 = null
  var chart2 = null
  var chartId1 = 'results-chart-1'
  var chartId2 = 'results-chart-2'

  $('input[type="checkbox"]').click(function() {
    $('#mnist, #roadsigns').toggle()
  });

  $('#roadsigns').hide();

  function showMnistError(errorMessage, data) {
    $('#mnist-results-error').text(errorMessage)
    $('#mnist-results-loading').hide()
    $('#mnist-results-error').show()
    if(data) {
      $('#mnist-results-data').show()
      $('#mnist-results-json').text(data)
    }
  }

  function showRoadsignsError(errorMessage, data) {
    $('#roadsigns-results-error').text(errorMessage)
    $('#roadsigns-results-loading').hide()
    $('#roadsigns-results-error').show()
    if(data) {
      $('#roadsigns-results-data').show()
      $('#rroadsigns-esults-json').text(data)
    }
  }

  function loadMnistResult(label, numberTitle) {
    
    $('#mnist-results-label').text(label)
    $('#mnist-results-data').hide()
    $('#mnist-results-error').hide()
    $('#mnist-results-loading').show()

    var mnist_model_url = $('#mnist_model_url').val()

    if(!mnist_model_url) {
      showMnistError('Please enter a Model Endpoint')
      return
    }

    var requestPayload = {
      model_url: mnist_model_url,
      numberTitle: numberTitle,
    }   

    console.log('here')
    
    $.ajax({
      method: 'POST',
      url: '/model',
      data: JSON.stringify(requestPayload),
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      success: function(response) {
        
        $('#mnist-results-loading').hide()
        
        var transformed = []
        response.predictions[0].map(function(output, i) {         
          transformed.push({          
            'probability': output,
            'class': classes[i],       
          })
        })

        transformed.sort((a, b) => (a.probability < b.probability) ? 1 : -1)

        transformed = transformed.slice(0, 5)

        var yAxis = []
        var xAxis = []

        transformed.map(function(entry, i) {
          xAxis.push(entry.probability)
          yAxis.push(entry.class)
        })

        var options = {
          chart: {
            id: chartId1,
            height: 350,
            type: 'bar'
          },
          plotOptions: {
            bar: {
              horizontal: true,
              dataLabels: {
                position: 'top'
              }              
            }            
          },
          legend: {
            show: true,
            showForSingleSeries: false,
            showForNullSeries: true,
            showForZeroSeries: true,
            position: 'bottom',
            horizontalAlign: 'center', 
            floating: false,
            fontSize: '17px',
          },
          dataLabels: {
            enabled: true,
          },
          series: [{
            name: 'Probability',
            data: xAxis, 
            title: {
              text: 'Class'
            },        
          }],
          xaxis: {
            categories: yAxis, // xaxis gets yAxis because we have a horizontal chart
            title: {
              text: 'Probability'
            },
            labels: {
              show: true,
              rotate: -45,
              rotateAlways: false,
              hideOverlappingLabels: true,
              showDuplicates: false,
              trim: true,
              minHeight: undefined,
              maxHeight: 120,
              style: {
                  colors: [],
                  fontSize: '15px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  cssClass: 'apexcharts-xaxis-label',
              },
              offsetX: 0,
              offsetY: 0,
              format: undefined,
              formatter: undefined
             },
          },
          yaxis: {         
            labels: {
              minWidth: 0,
              maxWidth: 300,
              style: {               
                  fontSize: '16px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  cssClass: 'apexcharts-yaxis-label',
              }                      
            },
          },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 300,
            animateGradually: {
                enabled: true,
                delay: 150
            },
            dynamicAnimation: {
                enabled: true,
                speed: 350
            }
          }
        }
               
        chart1 = new ApexCharts(document.querySelector("#mnist-results-chart"), options)        
        chart1.render()

        var dataString = JSON.stringify(transformed, null, 4)
        $('#mnist-results-data').show()
        $('#mnist-results-json').text(dataString)       
      },
      error: function(response) {
        showMnistError(response.status + ' ' + response.statusText, response.responseText)
      }
    })
  }

  function loadRoadsignsResult(label, b64EncodedData) {
    $('#roadsigns-results-label').text(label)
    $('#roadsigns-results-data').hide()
    $('#roadsigns-results-error').hide()
    $('#roadsigns-results-loading').show()
 
    var requestPayload = {
      instances: [
        {
          input_image_bytes: [b64EncodedData] 
        }        
      ]        
    }   

    $.ajax({
      method: 'POST',
      url: TENSORFLOW_URL,
      data: JSON.stringify(requestPayload),
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      success: function(response) {   
        $('#roadsigns-results-loading').hide()
        
        var transformed = []
        response.predictions[0].map(function(output, i) {         
          transformed.push({          
            'probability': output,
            'class': classes[i],            
          })
        })

        transformed.sort((a, b) => (a.probability < b.probability) ? 1 : -1)

        transformed = transformed.slice(0, 5)

        var yAxis = []
        var xAxis = []

        transformed.map(function(entry, i) {
          xAxis.push(entry.probability)
          yAxis.push(entry.class)
        })

        var options = {
          chart: {
            id: chartId2,
            height: 350,
            type: 'bar'
          },
          plotOptions: {
            bar: {
              horizontal: true,
              dataLabels: {
                position: 'top'
              }              
            }            
          },
          legend: {
            show: true,
            showForSingleSeries: false,
            showForNullSeries: true,
            showForZeroSeries: true,
            position: 'bottom',
            horizontalAlign: 'center', 
            floating: false,
            fontSize: '17px',
          },
          dataLabels: {
            enabled: true,
          },
          series: [{
            name: 'Probability',
            data: xAxis, 
            title: {
              text: 'Class'
            },        
          }],
          xaxis: {
            categories: yAxis, // xaxis gets yAxis because we have a horizontal chart
            title: {
              text: 'Probability'
            },
            labels: {
              show: true,
              rotate: -45,
              rotateAlways: false,
              hideOverlappingLabels: true,
              showDuplicates: false,
              trim: true,
              minHeight: undefined,
              maxHeight: 120,
              style: {
                  colors: [],
                  fontSize: '15px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  cssClass: 'apexcharts-xaxis-label',
              },
              offsetX: 0,
              offsetY: 0,
              format: undefined,
              formatter: undefined
             },
          },
          yaxis: {         
            labels: {
              minWidth: 0,
              maxWidth: 300,
              style: {               
                  fontSize: '16px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  cssClass: 'apexcharts-yaxis-label',
              }                      
            },
          },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 300,
            animateGradually: {
                enabled: true,
                delay: 150
            },
            dynamicAnimation: {
                enabled: true,
                speed: 350
            }
          }
        }
               
        chart2 = new ApexCharts(document.querySelector("#roadsigns-results-chart"), options)        
        chart2.render()

        var dataString = JSON.stringify(transformed, null, 4)
        $('#roadsigns-results-data').show()
        $('#roadsigns-results-json').text(dataString)       
      },
      error: function(response) {
        var errorMessage = response.status + ' ' + response.statusText
        $('#roadsigns-results-error').text(errorMessage)
        $('#roadsigns-results-loading').hide()
        $('#roadsigns-results-error').show()
        $('#roadsigns-results-data').show()
        $('#roadsigns-results-json').text(response.responseText)
      }
    })
  }

  function renderMnistImages() {
    mnistAppData.image_filenames.map(function(filename, i) {
      var label = mnistAppData.image_labels[i]      
      var elem = $([
        '<div class="card">',
          '<div class="card-image">',
            '<a class="modal-trigger" href="#resultsmodel"><img src="' + filename + '"></a>',
          '</div>',
          '<div class="card-content"><a class="modal-trigger" href="#resultsmodel"><p>' + label + '</p></a></div>',
          '<div class="card-action"><a class="modal-trigger button buttonSecondary waves-effect" href="#resultsmodel">Predict</a></div>',
        '</div>',
      ].join("\n"))

      elem.click(function() {
        if (chart1) {
          chart1.destroy()
        }
        loadMnistResult(label, i)
      })

      $('#mnist #image-cards').append(elem)
    })
  }

  function renderRoadsignsImages() {
    roadsignsAppData.image_filenames.map(function(filename, i) {
      var label = roadsignsAppData.image_labels[i]      
      var elem = $([
        '<div class="card">',
          '<div class="card-image">',
            '<a class="modal-trigger" href="#resultsmodel"><img src="' + filename + '"></a>',
          '</div>',
          '<div class="card-content"><a class="modal-trigger" href="#resultsmodel"><p>' + label + '</p></a></div>',
          '<div class="card-action"><a class="modal-trigger button buttonSecondary waves-effect" href="#resultsmodel">Predict</a></div>',
        '</div>',
      ].join("\n"))

      elem.click(function() {
        if (chart2) {
          chart2.destroy()
        }
        toDataURL(
          // 'https://www.gravatar.com/avatar/d50c83cc0c6523b4d3f6085295c953e0',
          filename,
          function(dataUrl) {
            // console.log('RESULT:', dataUrl)
            loadRoadsignsResult(label, dataUrl)
          }
        )
        // loadResult(label, imageData, filename)
      })

      $('#roadsigns #image-cards').append(elem)
    })
  }

  function toDataURL(src, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      var canvas = document.createElement('CANVAS');
      var ctx = canvas.getContext('2d');
      var dataURL;
      canvas.height = this.naturalHeight;
      canvas.width = this.naturalWidth;
      ctx.drawImage(this, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      let encodedBase64 = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

      // well, we need to do some replacements: https://www.tensorflow.org/api_docs/python/tf/io/decode_base64
      let encodedURLSafeb64 = encodedBase64.replace(/\+/g, '-') // Convert '+' to '-'
        .replace(/\//g, '_') // Convert '/' to '_'
        .replace(/=+$/, ''); // Remove ending '='

      callback(encodedURLSafeb64);
    };
    img.src = src;
    if (img.complete || img.complete === undefined) {
      img.src = "data:image/jpg;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      img.src = src;
    }
  }

  function loadAppData() {
    $.getJSON('/mnist_appdata.json', function(data) {
      mnistAppData = data
      renderMnistImages()
    })
    $.getJSON('/roadsigns_appdata.json', function(data) {
      roadsignsAppData = data
      renderRoadsignsImages()
    })
  }

  function loadClasses() {
    $.getJSON('/mnist_classes.json', function(data) {
      mnistClasses = data      
    })
    $.getJSON('/roadsigns_classes.json', function(data) {
      roadsignsClasses = data      
    })
  }

  $(function(){``

    $('.sidenav').sidenav()
    $('.modal').modal()

    $('#results-data').hide()
    
    loadAppData()
    loadClasses()
  })
})(jQuery)
