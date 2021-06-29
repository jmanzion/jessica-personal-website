from flask import Flask,request,jsonify,send_from_directory,Response,flash,redirect
import psycopg2
import os
import colorCompression
import requests
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--host', help='The host address',
                    type=str, default='0.0.0.0')
parser.add_argument('--port', help='The port to run on',
                    type=int, default=5000)
parser.add_argument(
    '--dev', help='Enable the server in dev mode.', type=bool, default=False)
parser.add_argument(
    '--dev-angular-app', help='Url to dev angular app.', type=str, default='http://localhost:4200/')
#parser.add_argument('--database', help='Database url.', type=str, default=None)
#parser.add_argument('--static-folder', help='Path to the static content,',
#                    type=str, default=os.path.abspath('/website/client-compiled/'))
args = parser.parse_args()

UPLOAD_FOLDER = os.path.abspath('client/src/assets/')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app = Flask(__name__, static_folder=os.path.abspath('images/'))

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db = os.environ.get('DATABASE_URL') 
#--env DATABASE_URL=postgres://igvoxqwfepyoxl:98a6e08ee66a1b384c3df5673570ae76cca60b5f5560d3fdaaa0076b0eca4c10@ec2-52-4-111-46.compute-1.amazonaws.com:5432/ddhqnu1qusofm8
schema = "Faces.sql"
conn = psycopg2.connect(db)

#establishing the connection
""" conn = psycopg2.connect(
    host="db",
    database="Faces",
    user="admin",
    password="datascience",
    port=5432) """

#Creating a cursor object using the cursor() method
#cursor = conn.cursor()

# let's create a table:
#cursor.execute("CREATE TABLE Faces (id integer NOT NULL, name text NOT NULL, path text NOT NULL);")

# and a row
#cursor.execute("INSERT INTO Faces (id,name,path) VALUES (2,'subject 1','subject01.glasses.gif');")

# Save changes to the database
#conn.commit()

@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404</h1><p>The resource could not be found.</p>", 404

@app.route("/",methods=['GET'])
@app.route("/home")
@app.route("/faces")
@app.route("/color-compression")
def index():
    if args.dev:
        return _proxy()
    else:
        return angular_app('index.html')

@app.route('/<path:name>')
def angular_app(name):
    if args.dev:
        return _proxy()
    else:
        return send_from_directory(os.path.join(os.getcwd(), os.path.abspath('/jessica-personal-website/client-compiled/')), name.lstrip('/'))

@app.route("/_/api/ColorCompression",methods=['GET'])
def execute_color_compression():
    query_params = request.args
    num_colors = query_params.get('num_colors')
    compressImage = query_params.get('compressImage')
    return colorCompression.execute_colorCompression(num_colors=num_colors,compressImage=compressImage)

@app.route('/_/api/upload',methods=['GET'])
def upload():
    query_params = request.args
    filename = query_params.get('filename')
    file = request.files['file']
    return print(filename)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
	
@app.route('/uploader', methods = ['GET', 'POST'])
def upload_file():
   if request.method == 'POST':
      f = request.files['file']
      return f.save(f.filename)

@app.route("/faces/all",methods=['GET'])
def list_faces():
    conn = psycopg2.connect(db)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Faces")
    all_faces = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(all_faces)

@app.route("/faces",methods=['GET'])
def get_face():
    query_param = request.args
    id = query_param.get('id')
    name = query_param.get('name')

    query = 'SELECT path FROM Faces WHERE'
    to_filter = []

    if id:
        query += ' id=' + id
        to_filter.append(int(id))
    if name:
        query += ' name= "' + name + '"'
    if not (id or name):
        return angular_app('index.html')
    
    query = query + ';'


    conn = psycopg2.connect(db)
    cursor = conn.cursor()
    cursor.execute(query, to_filter)
    results = cursor.fetchone()
    cursor.close()
    conn.close()

    img = str(results[0])
    return app.send_static_file(img)


def _proxy():
    resp = requests.request(
        method=request.method,
        url=request.url.replace(
            request.host_url, args.dev_angular_app),
        headers={key: value for (key, value)
                 in request.headers if key != 'Host'},
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False)
    excluded_headers = ['content-encoding',
                        'content-length', 'transfer-encoding', 'connection']
    headers = [(name, value) for (name, value) in resp.raw.headers.items()
               if name.lower() not in excluded_headers]
    response = Response(resp.content, resp.status_code, headers)
    return response

#make server reload with every code change
if __name__ == '__main__':
    #app.debug = True
    port = int(os.environ.get('PORT', 5000))
    app.run(host=args.host, port=args.port, debug=True)

