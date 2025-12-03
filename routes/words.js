const express = require('express');
const router = express.Router();
const { addWord, addMultipleWords, addWordWithCheck, getAllWords, getWordById, updateWord, deleteWord } = require('../functions/wordFunctions');

// GET: Получить все слова
router.get('/', async (req, res) => {
  try {
    const words = await getAllWords();
    res.json({
      success: true,
      count: words.length,
      data: words,
    });
  } catch (error) {
    console.error('Error in GET /words:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET: Получить слово по ID
router.get('/:id', async (req, res) => {
  try {
    const word = await getWordById(req.params.id);
    res.json({
      success: true,
      data: word,
    });
  } catch (error) {
    console.error('Error in GET /words/:id:', error);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// POST: Добавить одно слово
router.post('/', async (req, res) => {
  try {
    const { word, level, img, read } = req.body;

    // Валидация
    if (!word || !level) {
      return res.status(400).json({
        success: false,
        error: 'Поля "word" и "level" обязательны',
      });
    }

    const newWord = await addWord({ word, level, img, read });

    res.status(201).json({
      success: true,
      message: 'Слово успешно добавлено',
      data: newWord,
    });
  } catch (error) {
    console.error('Error in POST /words:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT: Обновить слово
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Убираем id из данных обновления, если он есть
    delete updateData.id;

    const updatedWord = await updateWord(id, updateData);

    res.json({
      success: true,
      message: 'Слово успешно обновлено',
      data: updatedWord,
    });
  } catch (error) {
    console.error('Error in PUT /words/:id:', error);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// PATCH: Частично обновить слово
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.id;

    const updatedWord = await updateWord(id, updateData);

    res.json({
      success: true,
      message: 'Слово успешно обновлено',
      data: updatedWord,
    });
  } catch (error) {
    console.error('Error in PATCH /words/:id:', error);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE: Удалить слово
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteWord(id);

    res.json(result);
  } catch (error) {
    console.error('Error in DELETE /words/:id:', error);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// GET: Поиск слов
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;

    const words = await prisma.word.findMany({
      where: {
        OR: [
          {
            word: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        word: 'asc',
      },
    });

    res.json({
      success: true,
      count: words.length,
      query: query,
      data: words,
    });
  } catch (error) {
    console.error('Error in GET /words/search/:query:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET: Получить слова по уровню
router.get('/level/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const levelNum = parseInt(level);

    if (isNaN(levelNum)) {
      return res.status(400).json({
        success: false,
        error: 'Уровень должен быть числом',
      });
    }

    const words = await prisma.word.findMany({
      where: {
        level: levelNum,
      },
      orderBy: {
        word: 'asc',
      },
    });

    res.json({
      success: true,
      level: levelNum,
      count: words.length,
      data: words,
    });
  } catch (error) {
    console.error('Error in GET /words/level/:level:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
