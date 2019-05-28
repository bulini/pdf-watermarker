const express = require('express')
const app = express()
const pdf = require('pdf-parse')
const https = require('https')
const fs = require('fs')
const HummusRecipe = require('hummus-recipe')

/**
 * Main Route
 */
app.get('/', async function(req,res,next) {
  
  let url = req.query.url
  let newname = req.query.filename
  let user = req.query.user

    console.log(req.query.url)
    downloadfile(url, newname).then((pdf) => {
      getnumPages(pdf).then( n => {
        console.log('file pdf' + pdf)
        console.log('n pagine ' + n)
        watermarkPdf(pdf, n, user).then((filename) => {
          res.download(filename)
        }).catch((a) => {
            console.log(a)
            console.log('sto qui nel catch interno' + a)
          })
      }).catch(console.log)
    }).catch((e) => {
    	console.log(e)
    	console.log('sto qui nel catch ' + e)
    	res.send('erore')
  })
})

/** 
 * Download file
 * @param {*} url 
 * @param {*} newFilename 
 */
var downloadfile = async (url, newFilename) => { 

  return new Promise((resolve, reject) => {
		console.log('inizio il download')
		const file = fs.createWriteStream(newFilename);
		const request = https.get(url, function(response) {
	  	response.pipe(file);
		})
		fs.close
		console.log(newFilename)
    setTimeout(function () {
      resolve(newFilename);
    }, 1000)
  })
}


/**
 * Add Watermark on pdf
 * @param {*} filename 
 * @param {*} numPages 
 * @param {*} user 
 */
var watermarkPdf = (filename, numPages, user) => {
  console.log('filename '+filename)
	return new Promise((resolve, reject) => {
		const pdfDoc = new HummusRecipe(filename, `${filename}`)
    console.log('num. pages ' + numPages)

    for (var i = 0; i < numPages;) {
      i++
      console.log(i)
      pdfDoc.editPage(i)
      pdfDoc.text(`Scaricato in data 23-05-2019 da ${user}`, 300, 500, {
        color: '333333', rotation: -60, fontSize: 30, align: 'center center', opacity: 0.3
      })
      pdfDoc.endPage()
    }

    pdfDoc.endPDF()
    console.log('Pdf Done!')
		resolve(`${filename}`)
	})

}

/**
 * Return number of pages
 * @param {*} filename 
 */
var getnumPages = (filename) => { 
  let dataBuffer = fs.readFileSync(filename)
  return new Promise((resolve, reject) => {
    pdf(dataBuffer).then(function (data) {
      console.log('Pagine funzione ' + data.numpages)
      const pagine = data.numpages
      console.log(pagine)
      resolve(pagine)
    })
  })
}

app.listen(4000, function () {
  console.log('Watermarker app on!');
});