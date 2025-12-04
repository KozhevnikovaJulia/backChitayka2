const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');
const prisma = new PrismaClient().$extends(withAccelerate());

const addWord = async wordData => {
  try {
    // Проверяем обязательные поля
    if (!wordData.word || !wordData.level) {
      throw new Error('Поля "word" и "level" обязательны');
    }

    // Создаем слово в базе данных
    const newWord = await prisma.word.create({
      data: {
        word: wordData.word,
        level: parseInt(wordData.level) || 1,
        img: wordData.img || null,
        read: wordData.read || false,
      },
    });

    console.log(`✅ Слово "${wordData.word}" добавлено с ID: ${newWord.id}`);
    return newWord;
  } catch (error) {
    console.error('❌ Ошибка при добавлении слова:', error.message);

    // Если слово уже существует (уникальное ограничение)
    if (error.code === 'P2002') {
      throw new Error(`Слово "${wordData.word}" уже существует в базе`);
    }

    throw error;
  }
};
const addMultipleWords = async wordsArray => {
  try {
    if (!Array.isArray(wordsArray) || wordsArray.length === 0) {
      throw new Error('Нужно передать массив слов');
    }

    // Преобразуем данные
    const wordsToCreate = wordsArray.map(word => ({
      word: word.word,
      level: parseInt(word.level) || 1,
      img: word.img || null,
      read: word.read || false,
    }));

    // Используем транзакцию для надежности
    const result = await prisma.$transaction(wordsToCreate.map(wordData => prisma.word.create({ data: wordData })));

    console.log(`✅ Добавлено ${result.length} слов`);
    return result;
  } catch (error) {
    console.error('❌ Ошибка при добавлении нескольких слов:', error.message);
    throw error;
  }
};

/**
 * Добавляет слово с проверкой на дубликаты
 * @param {Object} wordData - Данные слова
 * @returns {Promise<Object>} - Результат операции
 */
const addWordWithCheck = async wordData => {
  try {
    // Проверяем, существует ли уже такое слово
    const existingWord = await prisma.word.findFirst({
      where: {
        word: wordData.word,
      },
    });

    if (existingWord) {
      console.log(`⚠️ Слово "${wordData.word}" уже существует с ID: ${existingWord.id}`);
      return {
        success: false,
        message: 'Слово уже существует',
        data: existingWord,
      };
    }

    // Добавляем новое слово
    const newWord = await addWord(wordData);

    return {
      success: true,
      message: 'Слово успешно добавлено',
      data: newWord,
    };
  } catch (error) {
    console.error('❌ Ошибка при проверке и добавлении слова:', error.message);
    throw error;
  }
};

const getAllWords = async () => {
  try {
    const words = await prisma.word.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    console.log(`📋 Получено ${words.length} слов из базы`);
    return words;
  } catch (error) {
    console.error('❌ Ошибка при получении слов:', error.message);
    throw error;
  }
};

const getWordById = async id => {
  try {
    const word = await prisma.word.findUnique({
      where: { id: parseInt(id) },
    });

    if (!word) {
      throw new Error(`Слово с ID ${id} не найдено`);
    }

    return word;
  } catch (error) {
    console.error('❌ Ошибка при получении слова по ID:', error.message);
    throw error;
  }
};

const updateWord = async (id, updateData) => {
  try {
    const updatedWord = await prisma.word.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    console.log(`✏️ Слово с ID ${id} обновлено`);
    return updatedWord;
  } catch (error) {
    console.error('❌ Ошибка при обновлении слова:', error.message);

    if (error.code === 'P2025') {
      throw new Error(`Слово с ID ${id} не найдено`);
    }

    throw error;
  }
};

const deleteWord = async id => {
  try {
    const deletedWord = await prisma.word.delete({
      where: { id: parseInt(id) },
    });

    console.log(`🗑️ Слово "${deletedWord.word}" удалено`);
    return {
      success: true,
      message: `Слово "${deletedWord.word}" успешно удалено`,
      data: deletedWord,
    };
  } catch (error) {
    console.error('❌ Ошибка при удалении слова:', error.message);

    if (error.code === 'P2025') {
      throw new Error(`Слово с ID ${id} не найдено`);
    }

    throw error;
  }
};

module.exports = {
  addWord,
  addMultipleWords,
  addWordWithCheck,
  getAllWords,
  getWordById,
  updateWord,
  deleteWord,
  prisma,
};
