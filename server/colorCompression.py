import scipy.io as sio
import numpy as np
import matplotlib.pyplot as plt
from scipy.sparse import csc_matrix, find
import copy
import time
from flask import Flask, send_file
from PIL import Image
import io
import os
from flask import send_from_directory

images = ['football.bmp','GeorgiaTech.bmp','./images/fox.bmp']

#create vector for selected image with size(pixels,(r,g,b))
def get_image(image):
    img = plt.imread(image)
    pixels = img.shape[0]*img.shape[1]
    x = (img/255.0).reshape(pixels,img.shape[2])
    m,n = x.shape

    #plt.imshow(img)
    #plt.show()

    return x,m,n,img

#initialize centers
def init_centers(k,x):
    ind = np.random.randint(x.shape[0],size=k)
    c = x[ind,:]
    return c
#poor initialization of centers
def init_centers_poorly(k,x):
    ind = [0 for i in range(k)]
    ind[0] = np.random.randint(x.shape[0])
    for i in range(1,k):
        ind[i] = ind[i-1]+1
    c = x[ind,:]
    return c

#calculate Euclidean distance
def euc_distance(m,k,x,c):
    S = np.empty((m,k))
    for cno in range(k):
        d = np.linalg.norm(x-c[cno,:],ord=2,axis=1)
        S[:,cno] = d**2
    return S
#calculate manhattan distance
def man_distance(m,k,x,c):
    S = np.empty((m,k))
    for cno in range(k):
        d = np.linalg.norm(x-c[cno,:],ord=1,axis=1)
        S[:,cno] = d
    return S
    
#run k means clustering
def clustering(c,x,m,k):
    i=1
    c_old = copy.deepcopy(c) + 10
    #check if centers are still changing
    while (np.linalg.norm(c - c_old,ord='fro') > 1e-6):
        print("--iteration %d \n" % i)
        c_old = copy.deepcopy(c)

        # norm squared of the centroids;
        c2 = np.sum(np.power(c, 2), axis=0, keepdims=True)

        #find distance from centers to each point
        #Need to comment/uncomment depending on if want to use euclidean or manhattan
        S = euc_distance(m,k,x,c)
        #S = man_distance(m,k,x,c)

        #assign clusters based on cluster centers that are the shortest distance from each data point
        labels = np.argmin(S, axis=1)

        #update centers for each cluster
        for j in range(k):
            #use this if doing squared l-2 norm distance
            c[j,:] = np.mean(x[labels==j,:],axis=0)

            #use this if doing manhattan distance
            #c[j,:] = np.median(x[labels==j,:],axis=0)

        i += 1
    return labels, c


#dispay new image after clustering
def clustered_img(c,img,labels):
    img_clustered = np.array([c[i] for i in labels])
    new_img = np.reshape(img_clustered,(img.shape[0],img.shape[1],img.shape[2]),order='C')
    #plt.imshow(new_img)
    #plt.show()
    return new_img

def image(new_img):
    # my numpy array 
    #arr = np.array(new_img)

    # convert numpy array to PIL Image
    img = Image.fromarray((new_img* 255).astype(np.uint8))

    # create file-object in memory
    file_object = io.BytesIO()

    # write PNG in file-object
    img.save(file_object, 'JPEG')

    # move to beginning of file so `send_file()` it will read from start    
    file_object.seek(0)

    return send_file(file_object, mimetype='image/jpeg')
    

def execute_colorCompression(num_colors=5,compressImage='/client/src/assets/fox.bmp'):
    #switch the value of k here to choose number of clusters
    k=int(num_colors)
    #change the integer between 0, 1, or 2 for images in get_image to select which image to compress
    x,m,n,img = get_image(compressImage)
    #uncomment/comment between init_centers (random initialization) and init_centers_poorly (poor initialization)
    c = init_centers(k,x)
    #c = init_centers_poorly(k,x)
    #tic = time.time()
    labels, c = clustering(c,x,m,k)
    #toc = time.time()
    new_img = clustered_img(c,img,labels)
    return image(new_img)


    #print('Elapsed time is %f seconds \n' % float(toc - tic))
    #print('Cluster Assignment for each pixel:',labels)
    #print(k,'centroids:',c*255) 

#save image
#plt.imshow(new_img)
#plt.savefig('7_clusters_GT.png')