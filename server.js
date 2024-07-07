const express = require('express');
const basicAuth = require('express-basic-auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// 自定义认证函数
const username = process.env.USERNAME || 'admin';
const password = process.env.PASSWORD || 'admin';

const myAuthorizer = (username, password) => {
  const userMatches = basicAuth.safeCompare(username, username);
  const passwordMatches = basicAuth.safeCompare(password, password);
  return userMatches & passwordMatches;
}

// 应用基本认证中间件
app.use(basicAuth({
    authorizer: myAuthorizer,
    challenge: true,
    realm: 'Imb4T3st4pp',
}));

function formatDate(dateStr) {
    const dateObj = new Date(dateStr);
    const month = dateObj.getMonth() + 1;  // 月份从0开始计数，所以加1
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;  // 转换为月/日/年格式
}


app.post('/create-pdf', (req, res) => {
    const { name, address, date, purchasePrice, loanAmount, contactName, contactPhone } = req.body;
    const formattedDate = formatDate(date);
    const doc = new PDFDocument({
        margin: 50  // 设置页面边距
    });

    res.setHeader('Content-Disposition', 'attachment; filename="pre-approval.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    // 添加logo，并确保它在页面顶部居中
    const logoPath = path.join(__dirname, 'public', 'logo.png');
    doc.image(logoPath, (doc.page.width - 150) / 2, 50, { width: 150 }); // 设置宽度和计算居中的x位置
    doc.moveDown(8);

    // 文档标题
    doc.fontSize(20).font('Helvetica-Bold').text('Pre-Approval Letter', {
        align: 'center'
    });
    doc.moveDown(1.5);

    // 文档日期和借款人信息
    doc.fontSize(14).font('Helvetica').text(`Date: ${formattedDate}`, {
        align: 'left'
    });
    doc.text(`Borrower: ${name}`, {
        align: 'left'
    });
    doc.moveDown();

    // 贷款详情
    doc.fontSize(14).text('Loan Details:', {
        underline: true
    });
    doc.moveDown();
    doc.fontSize(14).list([
        `Property Address: ${address}`,
        `Purchase Price: $${purchasePrice}`,
        `Loan Amount: $${loanAmount}`,
        `Loan Product and Term: 30 Yrs Fixed`
    ], {
        bulletRadius: 2
    });
    doc.moveDown();

    // 注意事项
    doc.text(`Please note that this is not a final loan approval. This pre-approval is based on information you provided, and a preliminary review of your credit report and income. The interest rate and type of mortgage used to pre-approve you for this loan amount is subject to change, which would also change the terms of this pre-approval. This pre-approval is subject to change, and if updated information is required, the updates and changes may affect your loan approval.`, {
        align: 'justify'
    });
    doc.moveDown();

    // 联系信息
    doc.text(`If you have any questions, please do not hesitate to contact ${contactName} at ${contactPhone}`, {
        align: 'justify'
    });
    doc.moveDown();

    // 结语
    doc.text(`Sincerely,`, {
        align: 'left'
    });
    doc.moveDown();
    doc.text(`Ivan Gao`, {
        align: 'left'
    });
    doc.image(path.join(__dirname, 'public', 'signature.png'), { width: 80 });
    doc.moveDown(2)
    doc.text(`Office Manager`, {
        align: 'left'
    });
    doc.text(`Phone # 917-378-3328`, {
        align: 'left'
    });
    doc.fontSize(14).font('Helvetica').text('38-19 Union St #201, Flushing, NY 11354', {
        align: 'left'
    });

    doc.end();
    doc.pipe(res);
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
