const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');


// Import model
const connectDb = require('../model/FE2.js');
const { ObjectId } = require('mongodb');

// Lấy tất cả sản phẩm dạng JSON
router.get('/products', async (req, res,next) => {
  try {
    const db = await connectDb();
    const productCollection = db.collection('products');
    const products = await productCollection.find().toArray();
    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
//Lấy danh mục sản phẩm
router.get('/categories', async(req, res, next)=> {
  const db=await connectDb();
  const categoryCollection=db.collection('categories');
  const categories=await categoryCollection.find().toArray();
  if(categories){
    res.status(200).json(categories);
  }else{
    res.status(404).json({message : "Không tìm thấy"})
  }
}
);



//Tìm kiếm theo sản phẩm
router.get('/search/:keyword', async (req, res, next) => {
  try {
    const db = await connectDb();
    const productCollection = db.collection('products');
    const products = await productCollection.find({ name: new RegExp(req.params.keyword, 'i') }).toArray();
    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm nào" });
    }
  } catch (error) {
    console.error("Error fetching products by search:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
router.get('/productbycate/:idcate', async(req, res, next)=> {
  const db=await connectDb();
  const productCollection=db.collection('products');
  const products=await productCollection.find({categoryId:req.params.idcate}).toArray();
  if(products){
    res.status(200).json(products);
  }else{
    res.status(404).json({message : "Không tìm thấy"})
  }
}
);
router.get('/productdetail/:id', async(req, res, next)=> {
  let id = new ObjectId(req.params.id);
  const db=await connectDb();
  const productCollection=db.collection('products');
  const product=await productCollection.findOne({_id:id});
  if(product){
    res.status(200).json(product);
  }else{
    res.status(404).json({message : "Không tìm thấy"})
  }
}
);




const multer = require('multer');
//Thiết lập nơi lưu trữ và tên file
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
//Kiểm tra file upload
function checkFileUpLoad(req, file, cb){
if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
  return cb(new Error('Bạn chỉ được upload file ảnh'));
}
cb(null, true);
}
//Upload file
let upload = multer({ storage: storage, fileFilter: checkFileUpLoad });

//Thêm sản phẩm
router.post('/addproduct', upload.single('image'), async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection('products');
  const { name, price, description, categoryId } = req.body;
  const image = req.file.originalname;
  const newProduct = { name, price, description, categoryId, image };

  try {
    const result = await productCollection.insertOne(newProduct);
    // Check if insertedId exists (indicates successful insertion)
    if (result.insertedId) {
      res.status(200).json({ message: "Thêm sản phẩm thành công" });
    } else {
      res.status(500).json({ message: "Thêm sản phẩm thất bại" }); // Consider using 500 for unexpected errors
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" }); // Generic error message for user
  }
});


// Thêm danh mục
router.post('/addcategory', async (req, res, next) => {
  const db = await connectDb();
  const categoryCollection = db.collection('categories');
  const { name, description } = req.body;
  const createdAt = new Date(); // Thiết lập ngày giờ hiện tại
  const updatedAt = new Date(); // Thiết lập ngày giờ hiện tại

  // Tạo đối tượng danh mục mới
  const newCategory = { name, description, createdAt, updatedAt };

  try {
    const result = await categoryCollection.insertOne(newCategory);
    // Kiểm tra xem insertedId có tồn tại không (cho thấy việc chèn thành công)
    if (result.insertedId) {
      res.status(200).json({ message: "Thêm danh mục thành công" });
    } else {
      res.status(500).json({ message: "Thêm danh mục thất bại" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" }); // Thông báo lỗi chung cho người dùng
  }
});

//xóa danh mục

// Xóa danh mục
router.delete('/deletecategory/:id', async (req, res, next) => {
  const db = await connectDb();
  const categoryCollection = db.collection('categories');
  const categoryId = req.params.id;

  try {
    const result = await categoryCollection.deleteOne({ _id: new ObjectId(categoryId) });
    
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Xóa danh mục thành công" });
    } else {
      res.status(404).json({ message: "Danh mục không tồn tại" });
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

//Xóa sản phẩm
router.delete('/deleteproduct/:id', async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection('products');
  const id = new ObjectId(req.params.id);
  try {
    const result = await productCollection.deleteOne({ _id: id });
    if (result.deletedCount) {
      res.status(200).json({ message: "Xóa sản phẩm thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
  }
});


router.put('/updateproduct/:id', upload.single('image'), async (req, res, next) => {
  const db = await connectDb();
  const productCollection = db.collection('products');
  const id = new ObjectId(req.params.id);
  const { name, price, description, categoryId } = req.body;
  let updatedProduct = { name, price, description, categoryId };

  if (req.file) {
    const image = req.file.originalname;
    updatedProduct.image = image;
  }

  try {
    console.log("Updating product:", id, updatedProduct); // Debugging line
    const result = await productCollection.updateOne({ _id: id }, { $set: updatedProduct });
    if (result.matchedCount > 0) {
      res.status(200).json({ message: "Sửa sản phẩm thành công" });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    console.error("Error updating product:", error); // Debugging line
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
  }
});
// Sửa danh mục
router.put('/updatecategory/:id', async (req, res, next) => {
  const db = await connectDb();
  const categoryCollection = db.collection('categories');
  const id = new ObjectId(req.params.id);
  const { name, description } = req.body;
  const updatedCategory = { name, description, updatedAt: new Date() };

  try {
    const result = await categoryCollection.updateOne({ _id: id }, { $set: updatedCategory });
    if (result.matchedCount > 0) {
      res.status(200).json({ message: "Sửa danh mục thành công" });
    } else {
      res.status(404).json({ message: "Danh mục không tồn tại" });
    }
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
  }
});
// Xóa danh mục
router.delete('/deletecategory/:id', async (req, res, next) => {
  const db = await connectDb();
  const categoryCollection = db.collection('categories');
  const categoryId = req.params.id;

  try {
    const result = await categoryCollection.deleteOne({ _id: new ObjectId(categoryId) });
    
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Xóa danh mục thành công" });
    } else {
      res.status(404).json({ message: "Danh mục không tồn tại" });
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

const bcrypt = require('bcryptjs');
router.post('/register', async (req, res, next) => {
  const db = await connectDb();
  const userCollection = db.collection('users');
  const { email, password } = req.body;
  const user = await userCollection.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "Email đã tồn tại" });
  }else
  {
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = { email, password: hashPassword , role: 'user' };
    try {
      const result = await userCollection.insertOne(newUser);
      if (result.insertedId) {
        res.status(200).json({ message: "Đăng ký thành công" });
      } else {
        res.status(500).json({ message: "Đăng ký thất bại" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
    }
  }
 
});


router.post('/login', async (req, res) => {
  const db = await connectDb();
  const userCollection = db.collection('users');
  const { email, password } = req.body;
  
  try {
    const user = await userCollection.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }
    
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return res.status(400).json({ message: "Mật khẩu không chính xác" });
    }
    
    const token = jwt.sign({ email: user.email, role: user.role }, 'secret', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
  }
});


//Kiểm tra token qua Bearer


//Kiểm tra token qua Bearer

router.get('/checktoken', async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, 'secret', (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    res.status(200).json({ message: "Token hợp lệ" });
  }
  );
}
);


//lấy thông tin chi tiết user qua token
router.get('/detailuser', async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, 'secret', async (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    const db = await connectDb();
    const userCollection = db.collection('users');
    const userInfo = await userCollection.findOne({ email: user.email });
    if (userInfo) {
      res.status(200).json(userInfo);
    } else {
      res.status(404).json({ message: "Không tìm thấy user" });
    }
  });
});







module.exports = router;
