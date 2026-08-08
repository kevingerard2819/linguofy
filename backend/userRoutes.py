# from flask import Blueprint, request, jsonify
# from flask_bcrypt import Bcrypt
# from pymongo import MongoClient
# import os
# from dotenv import load_dotenv
# load_dotenv()

# MONGOUSER = os.getenv("MONGOUSER")
# MONGOPASS = os.getenv("MONGOPASS")
# mongoURL = f"mongodb+srv://{MONGOUSER}:{MONGOPASS}@cluster0.v1pdg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# userRoutes = Blueprint("userRoutes", __name__)
# bcrypt = Bcrypt()

# client = MongoClient(mongoURL)
# db = client["LinguofyDB"]
# users_collection = db["User"]

# @userRoutes.route('/', methods=['GET'])
# def home():
#     # print(mongoURL)
#     # client.server_info()
#     return "userRoutes.py is working"

# @userRoutes.route("/signup", methods=["POST"])
# def signup():
#     data = request.json
#     email = data.get("email")
#     password = data.get("password")

#     if users_collection.find_one({"email": email}):
#         return jsonify({"error": "User already exists"}), 400

#     hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
#     users_collection.insert_one({"email": email, "password": hashed_pw})

#     return jsonify({"message": "User created successfully"}), 201

# @userRoutes.route("/login", methods=["POST"])
# def login():
#     data = request.json
#     email = data.get("email")
#     password = data.get("password")

#     user = users_collection.find_one({"email": email})
#     if not user or not bcrypt.check_password_hash(user["password"], password):
#         return jsonify({"error": "Invalid credentials"}), 401

#     return jsonify({"message": "Login successful", "userID": str(user["_id"])}), 200
