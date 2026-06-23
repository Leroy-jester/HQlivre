const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(
  'mongodb+srv://admin:Josef@cluster0.t61um2v.mongodb.net/hqlivre?retryWrites=true&w=majority'
);

const MangaSchema = new mongoose.Schema({
  image_uri: String,
  nome: String,
  autor: String,
  chapters: Number,
  status: String,
  note: Number,
  description: String,
  favorite: Boolean,
  generos: [{ 
    id: Number, 
    nome_genero: String 
  }]
});

const Manga = mongoose.model(
  'Manga',
  MangaSchema
);

app.get('/', (req, res) => {
  res.send('API OK');
});

app.get('/mangas', async (req, res) => {
  const mangas = await Manga.find();
  res.json(mangas);
});

app.post('/mangas', async (req, res) => {
  const manga = await Manga.create(req.body);
  res.status(201).json(manga);
});

app.post('/teste', async (req, res) => {

  const manga = await Manga.create({
    nome: 'Naruto',
    autor: 'Masashi Kishimoto',
    chapters: 700,
    status: 'Finalizado',
    note: 5,
    description: 'Teste',
    favorite: false,
    image_uri: ''
  });

  res.json(manga);

});

app.patch('/mangas/:id', async (req, res) => {
  const manga =
    await Manga.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

  res.json(manga);
});

app.delete('/mangas/:id', async (req, res) => {
  await Manga.findByIdAndDelete(
    req.params.id
  );

  res.sendStatus(204);
});

app.listen(3000, () => {
  console.log('Servidor rodando');
});