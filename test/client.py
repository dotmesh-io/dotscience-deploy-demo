#!/usr/bin/python
                                                  
import numpy as np
from PIL import Image
import requests
    
def main():
  image_file = '../app/www/mnist_images/9.jpg'
  # Convert arbitrary sized jpeg image to 28x28 b/w image.
  data = np.array(Image.open(image_file).convert('L').resize((28, 28))).astype(np.float).reshape(-1, 28, 28, 1)
  # Dump jpeg image bytes as 28x28x1 tensor
  np.set_printoptions(threshold=np.inf)       
  json_request = '{{ "instances" : {} }}'.format(np.array2string(data, separator=',', formatter={'float':lambda x: "%.1f" % x}))

  print(json_request)

  #print(np.array2string(data, separator=',', formatter={'float':lambda x: "%.1f" % x}))
#  resp = requests.post('http://localhost:8085/model', data=json_request)
#  print('response.status_code: {}'.format(resp.status_code))     
#  print('response.content: {}'.format(resp.content))
                 
main()