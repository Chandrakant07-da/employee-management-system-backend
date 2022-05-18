const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");

const adminModel = require("../model/admin");
const employeeModel = require("../model/employee");

exports.adminSignup = async (req, res) => {
  const emailExist = await adminModel.findOne({ email: req.body.email });
  if (emailExist) {
    res.send("This Email Is Already Exist");
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  try {
    const signupSchema = Joi.object({
      firstName: Joi.string().min(3).max(20).required(),
      lastName: Joi.string().min(3).max(20).required(),
      email: Joi.string().min(6).max(25).required().email(),
      password: Joi.string().min(6).max(16).required(),
    });

    const { error } = await signupSchema.validateAsync(req.body);

    if (error) {
      res.send(error.details[0].message);
    } else {
      const admin = new adminModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
      });

      const saveAdmin = await admin.save();
      res.send("Admin Signup is Successfully Completed");
    }
  } catch (error) {
    res.send(error);
  }
};



exports.adminSignin = async (req, res) => {
  const admin = await adminModel.findOne({ email: req.body.email });

  if (!admin) return res.send("Account not Found Please Signup..!");

  const validatePassword = await bcrypt.compare(
    req.body.password,
    admin.password
  );

  if (!validatePassword) return res.send("Incorrect Password Please Enter Valid Password ..!");

  try {
    const signinSchema = Joi.object({
      email: Joi.string().min(6).required().email(),
      password: Joi.string().min(6).required(),
    });

    const { error } = await signinSchema.validateAsync(req.body);

    if (error) return res.send(error.details[0].message);
    else {
      const token = jwt.sign({ _id: admin._id }, process.env.TOKEN_SECRET);
      res.send({ token: token, admin: admin });
    }

  } catch (error) {
    res.send(error);
  }
};




exports.getAllEmployee = async (req, res) => {
  const employees = await employeeModel.find();

  try {
    res.send(employees);
  } catch (error) {
    res.send(error);
  }

};



exports.deleteEmployee = (req, res) => {
  employeeModel.deleteOne({ _id: req.params.id }, (error) => {
    if (error) {
      res.send(error);
    } else {
      res.send("Employee Detail Deleted");
    }
  });
};

exports.editEmployee = (req, res) => {

  employeeModel.findOne({ _id: req.params.id }, (error, employee) => {
    if (error) {
      res.send(error);
    } else {
      employee.firstName = req.body.firstName
        ? req.body.firstName
        : employee.firstName;
      employee.lastName = req.body.lastName
        ? req.body.lastName
        : employee.lastName;

      employee.save((error) => {
        if (error) {
          res.send(error);
        } else {
          res.send("Employee Details Edited");
        }
      });
    }
  });
};

exports.addEmployee = async (req, res) => {
  const emailExist = await employeeModel.findOne({ email: req.body.email });
  if (emailExist) {
    res.send("This Email is Already Exists..!");
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  try {
    const signupSchema = Joi.object({
     firstName: Joi.string().min(3).max(20).required(),
     lastName: Joi.string().min(3).max(20).required(),
     email: Joi.string().min(6).max(25).required().email(),
     password: Joi.string().min(6).max(16).required(),
    });

    const { error } = await signupSchema.validateAsync(req.body);

    if (error) {
      res.send(error.details[0].message);
    } else {
      const employee = new employeeModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
      });

      const saveEmployee = await employee.save();
      res.send("Employee Signup is Successfully Completed");
    }
  } catch (error) {
    res.send(error);
  }
};
