(function($){

  var appData = null
  var classes = null

  var chart = null
  var chartId = 'results-chart-1'

  function showError(errorMessage, data) {
    $('#results-error').text(errorMessage)
    $('#results-loading').hide()
    $('#results-error').show()
    if(data) {
      $('#results-data').show()
      $('#results-json').text(data)
    }
  }

  function loadResult(label, imageRows) {
    
    $('#results-label').text(label)
    $('#results-data').hide()
    $('#results-error').hide()
    $('#results-loading').show()

    var model_url = $('#model_url').val()

    if(!model_url) {
      showError('Please enter a Model URL')
      return
    }

    var request_body = {
      inputs: {
        conv2d_input: [imageRows]
      }
    }

    var requestPayload = {
      model_url: model_url,
      request_body: request_body,
    }   

    $.ajax({
      method: 'POST',
      url: '/model',
      data: JSON.stringify(requestPayload),
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      success: function(response) {
        
        $('#results-loading').hide()
        
        var transformed = []
        response.outputs[0].map(function(output, i) {         
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
            id: chartId,
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
               
        chart = new ApexCharts(document.querySelector("#results-chart"), options)        
        chart.render()

        var dataString = JSON.stringify(transformed, null, 4)
        $('#results-data').show()
        $('#results-json').text(dataString)       
      },
      error: function(response) {
        showError(response.status + ' ' + response.statusText, response.responseText)
      }
    })
  }

  function renderImages() {
    appData.image_filenames.map(function(filename, i) {
      var label = appData.image_labels[i]      
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
        if (chart) {
          chart.destroy()
        }
        toDataURL(
          // 'https://www.gravatar.com/avatar/d50c83cc0c6523b4d3f6085295c953e0',
          filename,
          function(dataUrl) {
            // console.log('RESULT:', dataUrl)
            loadResult(label, dataUrl)
          }
        )
        // loadResult(label, imageData, filename)
      })

      $('#image-cards').append(elem)
    })
  }

  function getColorIndicesForCoord(x, y, width) {
    var red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
  }

  function toDataURL(src, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      var canvas = document.createElement('CANVAS');
      var ctx = canvas.getContext('2d');

      var imageWidth = this.naturalWidth
      var imageHeight = this.naturalHeight
      
      canvas.width = imageHeight
      canvas.height = imageWidth
      
      ctx.drawImage(this, 0, 0)

      // convert the image into greyscale tensor format
      var imageData = ctx.getImageData(0, 0, imageWidth, imageHeight)
      var imageRows = []
      for(var row=0; row<imageHeight; row++) {
        var imageRow = []
        for(var col=0; col<imageWidth; col++) {
          var indexes = {
            red: getColorIndicesForCoord(row, col, imageWidth)[0],
            green: getColorIndicesForCoord(row, col, imageWidth)[1],
            blue: getColorIndicesForCoord(row, col, imageWidth)[2],
          }
          var colors = {
            red: imageData.data[indexes.red],
            green: imageData.data[indexes.green],
            blue: imageData.data[indexes.blue],
          }
          var grey = colors.red * 0.2126 + colors.green * 0.7152 + colors.blue * 0.0722
          imageRow.push([grey/255])     
        }
        imageRows.push(imageRow)
      }
      callback(imageRows);
    };
    img.src = src;
    if (img.complete || img.complete === undefined) {
      img.src = "data:image/jpg;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      img.src = src;
    }
  }
    

  function loadAppData() {
    $.getJSON('/appdata.json', function(data) {
      appData = data
      renderImages()
    })
  }

  function loadClasses() {
    $.getJSON('/classes.json', function(data) {
      classes = data      
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
