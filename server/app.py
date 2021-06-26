from flask import Flask,request,jsonify,send_from_directory
import psycopg2
import os
import colorCompression

app = Flask(__name__, static_folder=os.path.abspath('images/'))

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
    return angular_app('index.html')

@app.route('/<path:name>')
def angular_app(name):
    return send_from_directory(os.path.join(os.getcwd(), os.path.abspath('/jessica-personal-website/client-compiled/')), name.lstrip('/'))

@app.route("/_/api/ColorCompression",methods=["GET"])
def execute_color_compression():
    return colorCompression.execute_colorCompression()
    #return 'hello'

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

#make server reload with every code change
if __name__ == '__main__':
    #app.debug = True
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

