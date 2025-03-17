// resolvers.js
import { GraphQLError } from 'graphql';
import { ObjectId } from 'mongodb';
import { getRedisClient } from './config/redisConnection.js';

import {
  artists as artistsCollectionFn,
  albums as albumsCollectionFn,
  recordcompanies as recordCompaniesCollectionFn,
  songs as songsCollectionFn  // New: songs collection
} from './config/mongoCollections.js';

// Validation Helpers
import {
  checkNonEmptyString,
  checkLettersOnly,
  checkValidDate,
  checkValidYear,
  checkArrayOfLetters,
  checkMusicGenre,
  checkSongsArray,
  checkSongDuration  // New: duration validator
} from './validation.js';

export const resolvers = {
  // Field Resolvers 

  Artist: {
    albums: async (parent) => {
      try {
        const albumsCollection = await albumsCollectionFn();
        const artistObjId = parent._id;
        const albumDocs = await albumsCollection.find({ artistId: artistObjId }).toArray();
        // 这里不直接返回完整数据，而仅返回基础字段（不包含 artist、recordCompany、songs）
        return albumDocs.map((a) => ({
          id: a._id.toString(),
          title: a.title,
          releaseDate: a.releaseDate,
          genre: a.genre,
          artistId: a.artistId,
          recordCompanyId: a.recordCompanyId
        }));
      } catch (e) {
        throw new GraphQLError(e);
      }
    },
    numOfAlbums: async (parent) => {
      try {
        const albumsCollection = await albumsCollectionFn();
        const artistObjId = parent._id;
        return albumsCollection.countDocuments({ artistId: artistObjId });
      } catch (e) {
        throw new GraphQLError(e);
      }
    }
  },

  Album: {
    artist: async (parent) => {
      try {
        const artistsCollection = await artistsCollectionFn();
        const artistDoc = await artistsCollection.findOne({ _id: parent.artistId });
        if (!artistDoc) return null;
        // 返回原始的基础字段（不含 albums、numOfAlbums）
        return {
          id: artistDoc._id.toString(),
          name: artistDoc.name,
          dateFormed: artistDoc.dateFormed,
          members: artistDoc.members
        };
      } catch (e) {
        throw new GraphQLError(e);
      }
    },
    recordCompany: async (parent) => {
      try {
        const rcCollection = await recordCompaniesCollectionFn();
        const companyDoc = await rcCollection.findOne({ _id: parent.recordCompanyId });
        if (!companyDoc) return null;
        return {
          id: companyDoc._id.toString(),
          name: companyDoc.name,
          foundedYear: companyDoc.foundedYear,
          country: companyDoc.country
        };
      } catch (e) {
        throw new GraphQLError(e);
      }
    },
    // 返回 Song 对象时，只返回基础字段
    songs: async (parent) => {
      try {
        const songsCollection = await songsCollectionFn();
        const albumObjId = parent._id;
        const songDocs = await songsCollection.find({ albumId: albumObjId }).toArray();
        return songDocs.map((s) => ({
          id: s._id.toString(),
          title: s.title,
          duration: s.duration,
          albumId: s.albumId
        }));
      } catch (e) {
        throw new GraphQLError(e);
      }
    }
  },

  RecordCompany: {
    albums: async (parent) => {
      try {
        const albumsCollection = await albumsCollectionFn();
        const companyObjId = parent._id;
        const albumDocs = await albumsCollection.find({ recordCompanyId: companyObjId }).toArray();
        return albumDocs.map((a) => ({
          id: a._id.toString(),
          title: a.title,
          releaseDate: a.releaseDate,
          genre: a.genre,
          artistId: a.artistId,
          recordCompanyId: a.recordCompanyId
        }));
      } catch (e) {
        throw new GraphQLError(e);
      }
    },
    numOfAlbums: async (parent) => {
      try {
        const albumsCollection = await albumsCollectionFn();
        const companyObjId = parent._id;
        return albumsCollection.countDocuments({ recordCompanyId: companyObjId });
      } catch (e) {
        throw new GraphQLError(e);
      }
    }
  },

  // Resolver for Song type.
  Song: {
    // 返回完整的 Album 对象时，只返回基础字段
    albumId: async (parent) => {
      try {
        const albumsCollection = await albumsCollectionFn();
        const albumDoc = await albumsCollection.findOne({ _id: parent.albumId });
        if (!albumDoc) return null;
        return {
          id: albumDoc._id.toString(),
          title: albumDoc.title,
          releaseDate: albumDoc.releaseDate,
          genre: albumDoc.genre,
          artistId: albumDoc.artistId,
          recordCompanyId: albumDoc.recordCompanyId
        };
      } catch (e) {
        throw new GraphQLError(e);
      }
    }
  },

  // Query Resolvers
  Query: {
    artists: async () => {
      const redisClient = getRedisClient();
      const cacheKey = 'all_artists';
      try {
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log('Returning artists from Redis cache');
          // 将缓存数据转换为基础字段对象
          return JSON.parse(cached);
        }
        const artistsCollection = await artistsCollectionFn();
        const docs = await artistsCollection.find({}).toArray();
        // 只保留基础字段，不包含计算字段
        const results = docs.map((a) => ({
          id: a._id.toString(),
          name: a.name,
          dateFormed: a.dateFormed,
          members: a.members
        }));
        await redisClient.set(cacheKey, JSON.stringify(results), { EX: 60 * 60 });
        return results;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    albums: async () => {
      const redisClient = getRedisClient();
      const cacheKey = 'all_albums';
      try {
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log('Returning albums from Redis cache');
          return JSON.parse(cached);
        }
        const albumsCollection = await albumsCollectionFn();
        const docs = await albumsCollection.find({}).toArray();
        // 只缓存基础字段，不包含 artist、recordCompany、songs
        const results = docs.map((a) => ({
          id: a._id.toString(),
          title: a.title,
          releaseDate: a.releaseDate,
          genre: a.genre,
          artistId: a.artistId,
          recordCompanyId: a.recordCompanyId
        }));
        await redisClient.set(cacheKey, JSON.stringify(results), { EX: 60 * 60 });
        return results;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    recordCompanies: async () => {
      const redisClient = getRedisClient();
      const cacheKey = 'all_companies';
      try {
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log('Returning recordCompanies from Redis cache');
          return JSON.parse(cached);
        }
        const rcCollection = await recordCompaniesCollectionFn();
        const docs = await rcCollection.find({}).toArray();
        // 只缓存基础字段
        const results = docs.map((c) => ({
          id: c._id.toString(),
          name: c.name,
          foundedYear: c.foundedYear,
          country: c.country
        }));
        await redisClient.set(cacheKey, JSON.stringify(results), { EX: 60 * 60 });
        return results;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    getArtistById: async (_, { _id }) => {
      const redisClient = getRedisClient();
      const cacheKey = `artist:${_id}`;
      try {
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`Returning artist:${_id} from Redis`);
          return JSON.parse(cached);
        }
        const artistObjId = new ObjectId(_id);
        const artistsCollection = await artistsCollectionFn();
        const artistDoc = await artistsCollection.findOne({ _id: artistObjId });
        if (!artistDoc) {
          throw new GraphQLError(`Artist with id=${_id} not found`);
        }
        const result = {
          id: artistDoc._id.toString(),
          name: artistDoc.name,
          dateFormed: artistDoc.dateFormed,
          members: artistDoc.members
        };
        await redisClient.set(cacheKey, JSON.stringify(result));
        return result;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    getAlbumById: async (_, { _id }) => {
      const redisClient = getRedisClient();
      const cacheKey = `album:${_id}`;
      try {
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`Returning album:${_id} from Redis`);
          return JSON.parse(cached);
        }
        const albumObjId = new ObjectId(_id);
        const albumsCollection = await albumsCollectionFn();
        const albumDoc = await albumsCollection.findOne({ _id: albumObjId });
        if (!albumDoc) {
          throw new GraphQLError(`Album with id=${_id} not found`);
        }
        const result = {
          id: albumDoc._id.toString(),
          title: albumDoc.title,
          releaseDate: albumDoc.releaseDate,
          genre: albumDoc.genre,
          artistId: albumDoc.artistId,
          recordCompanyId: albumDoc.recordCompanyId
        };
        await redisClient.set(cacheKey, JSON.stringify(result));
        return result;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    getCompanyById: async (_, { _id }) => {
      const redisClient = getRedisClient();
      const cacheKey = `company:${_id}`;
      try {
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`Returning company:${_id} from Redis`);
          return JSON.parse(cached);
        }
        const companyObjId = new ObjectId(_id);
        const rcCollection = await recordCompaniesCollectionFn();
        const companyDoc = await rcCollection.findOne({ _id: companyObjId });
        if (!companyDoc) {
          throw new GraphQLError(`Company with id=${_id} not found`);
        }
        const result = {
          id: companyDoc._id.toString(),
          name: companyDoc.name,
          foundedYear: companyDoc.foundedYear,
          country: companyDoc.country
        };
        await redisClient.set(cacheKey, JSON.stringify(result));
        return result;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    getSongsByArtistId: async (_, { artistId }) => {
      const redisClient = getRedisClient();
      const cacheKey = `songs:${artistId}`;
      try {
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`Returning songs for artist:${artistId} from Redis`);
          return JSON.parse(cached);
        }
        const artistObjId = new ObjectId(artistId);
        const albumsCollection = await albumsCollectionFn();
        const albumDocs = await albumsCollection.find({ artistId: artistObjId }).toArray();
        let songs = [];
        for (let album of albumDocs) {
          const songsCollection = await songsCollectionFn();
          const songDocs = await songsCollection.find({ albumId: album._id }).toArray();
          songs = songs.concat(songDocs.map(s => ({
            id: s._id.toString(),
            title: s.title,
            duration: s.duration,
            albumId: s.albumId
          })));
        }
        await redisClient.set(cacheKey, JSON.stringify(songs), { EX: 60 * 60 });
        return songs;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    albumsByGenre: async (_, { genre }) => {
      const redisClient = getRedisClient();
      try {
        const genreUpper = checkMusicGenre(genre);
        const cacheKey = `genre:${genreUpper.toLowerCase()}`;
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`Returning albumsByGenre:${genreUpper} from Redis`);
          return JSON.parse(cached);
        }
        const albumsCollection = await albumsCollectionFn();
        const albumDocs = await albumsCollection.find({ genre: genreUpper }).toArray();
        const results = albumDocs.map((a) => ({
          id: a._id.toString(),
          title: a.title,
          releaseDate: a.releaseDate,
          genre: a.genre,
          artistId: a.artistId,
          recordCompanyId: a.recordCompanyId
        }));
        await redisClient.set(cacheKey, JSON.stringify(results), { EX: 60 * 60 });
        return results;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    companyByFoundedYear: async (_, { min, max }) => {
      const redisClient = getRedisClient();
      const cacheKey = `founded:${min}:${max}`;
      try {
        if (min < 1900) throw new GraphQLError('min must be >= 1900');
        if (max >= 2025) throw new GraphQLError('max must be < 2025');
        if (max <= min) throw new GraphQLError('max must be > min');
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`Returning companyByFoundedYear:${min}-${max} from Redis`);
          return JSON.parse(cached);
        }
        const rcCollection = await recordCompaniesCollectionFn();
        const docs = await rcCollection.find({ foundedYear: { $gte: min, $lte: max } }).toArray();
        const results = docs.map((c) => ({
          id: c._id.toString(),
          name: c.name,
          foundedYear: c.foundedYear,
          country: c.country
        }));
        await redisClient.set(cacheKey, JSON.stringify(results), { EX: 60 * 60 });
        return results;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    searchArtistByArtistName: async (_, { searchTerm }) => {
      const redisClient = getRedisClient();
      try {
        const trimmedTerm = checkNonEmptyString(searchTerm, 'searchTerm');
        const lowerTerm = trimmedTerm.toLowerCase();
        const cacheKey = `search:${lowerTerm}`;
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`Returning searchArtistByArtistName:${lowerTerm} from Redis`);
          return JSON.parse(cached);
        }
        const regex = new RegExp(trimmedTerm, 'i');
        const artistsCollection = await artistsCollectionFn();
        const artistDocs = await artistsCollection.find({ name: regex }).toArray();
        const results = artistDocs.map((a) => ({
          id: a._id.toString(),
          name: a.name,
          dateFormed: a.dateFormed,
          members: a.members
        }));
        await redisClient.set(cacheKey, JSON.stringify(results), { EX: 60 * 60 });
        return results;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    // --- New Song Queries ---
    getSongById: async (_, { _id }) => {
      const redisClient = getRedisClient();
      const cacheKey = `song:${_id}`;
      try {
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`Returning song:${_id} from Redis`);
          return JSON.parse(cached);
        }
        const songObjId = new ObjectId(_id);
        const songsCollection = await songsCollectionFn();
        const songDoc = await songsCollection.findOne({ _id: songObjId });
        if (!songDoc) {
          throw new GraphQLError(`Song with id=${_id} not found`);
        }
        const result = {
          id: songDoc._id.toString(),
          title: songDoc.title,
          duration: songDoc.duration,
          albumId: songDoc.albumId
        };
        await redisClient.set(cacheKey, JSON.stringify(result));
        return result;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    getSongsByAlbumId: async (_, { _id }) => {
      const redisClient = getRedisClient();
      const cacheKey = `songs:album:${_id}`;
      try {
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`Returning songs for album:${_id} from Redis`);
          return JSON.parse(cached);
        }
        const albumObjId = new ObjectId(_id);
        const songsCollection = await songsCollectionFn();
        const songDocs = await songsCollection.find({ albumId: albumObjId }).toArray();
        const results = songDocs.map((s) => ({
          id: s._id.toString(),
          title: s.title,
          duration: s.duration,
          albumId: s.albumId
        }));
        await redisClient.set(cacheKey, JSON.stringify(results), { EX: 60 * 60 });
        return results;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    searchSongByTitle: async (_, { searchTitleTerm }) => {
      const redisClient = getRedisClient();
      try {
        const trimmedTerm = checkNonEmptyString(searchTitleTerm, 'searchTitleTerm');
        const lowerTerm = trimmedTerm.toLowerCase();
        const cacheKey = `searchSongByTitle:${lowerTerm}`;
        let cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`Returning searchSongByTitle:${lowerTerm} from Redis`);
          return JSON.parse(cached);
        }
        const regex = new RegExp(trimmedTerm, 'i');
        const songsCollection = await songsCollectionFn();
        const songDocs = await songsCollection.find({ title: regex }).toArray();
        const results = songDocs.map((s) => ({
          id: s._id.toString(),
          title: s.title,
          duration: s.duration,
          albumId: s.albumId
        }));
        await redisClient.set(cacheKey, JSON.stringify(results), { EX: 60 * 60 });
        return results;
      } catch (e) {
        throw new GraphQLError(e);
      }
    }
  },

  // Mutation Resolvers
  Mutation: {
    addArtist: async (_, { name, date_formed, members }) => {
      const redisClient = getRedisClient();
      try {
        const validName = checkLettersOnly(checkNonEmptyString(name, 'name'), 'name');
        const validDate = checkValidDate(date_formed, 'date_formed');
        const validMembers = checkArrayOfLetters(members, 'members');
        const artistsCollection = await artistsCollectionFn();
        const newArtist = {
          _id: new ObjectId(),
          name: validName,
          dateFormed: validDate,
          members: validMembers,
          albums: []
        };
        const insertResult = await artistsCollection.insertOne(newArtist);
        if (!insertResult.acknowledged) {
          throw new GraphQLError('Could not add Artist');
        }
        await redisClient.del('all_artists');
        const returned = {
          id: newArtist._id.toString(),
          name: newArtist.name,
          dateFormed: newArtist.dateFormed,
          members: newArtist.members
        };
        await redisClient.set(`artist:${returned.id}`, JSON.stringify(returned));
        return returned;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    editArtist: async (_, { _id, name, date_formed, members }) => {
      const redisClient = getRedisClient();
      try {
        const artistObjId = new ObjectId(_id);
        const updateFields = {};
        if (typeof name === 'string') {
          const validName = checkLettersOnly(checkNonEmptyString(name, 'name'), 'name');
          updateFields.name = validName;
        }
        if (typeof date_formed === 'string') {
          const validDate = checkValidDate(date_formed, 'date_formed');
          updateFields.dateFormed = validDate;
        }
        if (Array.isArray(members)) {
          const validMembers = checkArrayOfLetters(members, 'members');
          updateFields.members = validMembers;
        }
        if (!Object.keys(updateFields).length) {
          throw new GraphQLError('No valid fields provided to update');
        }
        const artistsCollection = await artistsCollectionFn();
        const updateResult = await artistsCollection.updateOne(
          { _id: artistObjId },
          { $set: updateFields }
        );
        if (!updateResult.matchedCount) {
          throw new GraphQLError(`Artist with id=${_id} not found`);
        }
        await redisClient.del('all_artists');
        await redisClient.del(`artist:${_id}`);
        const updatedDoc = await artistsCollection.findOne({ _id: artistObjId });
        const returned = {
          id: updatedDoc._id.toString(),
          name: updatedDoc.name,
          dateFormed: updatedDoc.dateFormed,
          members: updatedDoc.members
        };
        await redisClient.set(`artist:${_id}`, JSON.stringify(returned));
        return returned;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    removeArtist: async (_, { _id }) => {
      const redisClient = getRedisClient();
      try {
        const artistObjId = new ObjectId(_id);
        const artistsCollection = await artistsCollectionFn();
        const albumsCollection = await albumsCollectionFn();
        const rcCollection = await recordCompaniesCollectionFn();
        const artistDoc = await artistsCollection.findOne({ _id: artistObjId });
        if (!artistDoc) {
          throw new GraphQLError(`Artist with id=${_id} not found`);
        }
        const albumDocs = await albumsCollection.find({ artistId: artistObjId }).toArray();
        const albumIds = albumDocs.map((a) => a._id);
        for (let albumDoc of albumDocs) {
          await rcCollection.updateOne(
            { _id: albumDoc.recordCompanyId },
            { $pull: { albums: albumDoc._id } }
          );
        }
        // Delete all albums for that artist
        await albumsCollection.deleteMany({ artistId: artistObjId });
        // Delete all songs for those albums
        const songsCollection = await songsCollectionFn();
        for (let albumId of albumIds) {
          await songsCollection.deleteMany({ albumId: albumId });
          await redisClient.del(`album:${albumId.toString()}`);
          await redisClient.del(`songs:album:${albumId.toString()}`);
        }
        const deleteResult = await artistsCollection.deleteOne({ _id: artistObjId });
        if (!deleteResult.deletedCount) {
          throw new GraphQLError(`Could not delete artist with id=${_id}`);
        }
        await redisClient.del('all_artists');
        await redisClient.del(`artist:${_id}`);
        await redisClient.del(`songs:${_id}`);
        await redisClient.del('all_albums'); 
        return {
          id: artistDoc._id.toString(),
          name: artistDoc.name,
          dateFormed: artistDoc.dateFormed,
          members: artistDoc.members
        };
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    addCompany: async (_, { name, founded_year, country }) => {
      const redisClient = getRedisClient();
      try {
        const validName = checkLettersOnly(checkNonEmptyString(name, 'name'), 'name');
        const validYear = checkValidYear(founded_year, 'founded_year');
        const validCountry = checkNonEmptyString(country, 'country');
        const rcCollection = await recordCompaniesCollectionFn();
        const newCompany = {
          _id: new ObjectId(),
          name: validName,
          foundedYear: validYear,
          country: validCountry,
          albums: []
        };
        const insertResult = await rcCollection.insertOne(newCompany);
        if (!insertResult.acknowledged) {
          throw new GraphQLError('Could not add RecordCompany');
        }
        await redisClient.del('all_companies');
        const returned = {
          id: newCompany._id.toString(),
          name: newCompany.name,
          foundedYear: newCompany.foundedYear,
          country: newCompany.country
        };
        await redisClient.set(`company:${returned.id}`, JSON.stringify(returned));
        return returned;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    editCompany: async (_, { _id, name, founded_year, country }) => {
      const redisClient = getRedisClient();
      try {
        const companyObjId = new ObjectId(_id);
        const updateFields = {};
        if (typeof name === 'string') {
          const validName = checkLettersOnly(checkNonEmptyString(name, 'name'), 'name');
          updateFields.name = validName;
        }
        if (typeof founded_year === 'number') {
          const validYear = checkValidYear(founded_year, 'founded_year');
          updateFields.foundedYear = validYear;
        }
        if (typeof country === 'string') {
          const validCountry = checkNonEmptyString(country, 'country');
          updateFields.country = validCountry;
        }
        if (!Object.keys(updateFields).length) {
          throw new GraphQLError('No valid fields provided to update');
        }
        const rcCollection = await recordCompaniesCollectionFn();
        const updateResult = await rcCollection.updateOne(
          { _id: companyObjId },
          { $set: updateFields }
        );
        if (!updateResult.matchedCount) {
          throw new GraphQLError(`RecordCompany with id=${_id} not found`);
        }
        await redisClient.del('all_companies');
        await redisClient.del(`company:${_id}`);
        const updatedDoc = await rcCollection.findOne({ _id: companyObjId });
        const returned = {
          id: updatedDoc._id.toString(),
          name: updatedDoc.name,
          foundedYear: updatedDoc.foundedYear,
          country: updatedDoc.country
        };
        await redisClient.set(`company:${_id}`, JSON.stringify(returned));
        return returned;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    removeCompany: async (_, { _id }) => {
      const redisClient = getRedisClient();
      try {
        const companyObjId = new ObjectId(_id);
        const rcCollection = await recordCompaniesCollectionFn();
        const albumsCollection = await albumsCollectionFn();
        const companyDoc = await rcCollection.findOne({ _id: companyObjId });
        if (!companyDoc) {
          throw new GraphQLError(`Company with id=${_id} not found`);
        }
        const albumDocs = await albumsCollection.find({ recordCompanyId: companyObjId }).toArray();
        const albumIds = albumDocs.map((album) => album._id.toString());
        await albumsCollection.deleteMany({ recordCompanyId: companyObjId });
        const deleteResult = await rcCollection.deleteOne({ _id: companyObjId });
        if (!deleteResult.deletedCount) {
          throw new GraphQLError(`Could not delete company with id=${_id}`);
        }
        await redisClient.del('all_companies');
        await redisClient.del(`company:${_id}`);
        await redisClient.del('all_albums');
        for (let albumId of albumIds) {
          await redisClient.del(`album:${albumId}`);
          await redisClient.del(`songs:album:${albumId}`);
        }
        return {
          id: companyDoc._id.toString(),
          name: companyDoc.name,
          foundedYear: companyDoc.foundedYear,
          country: companyDoc.country
        };
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    addAlbum: async (_, { title, releaseDate, genre, songs, artistId, companyId }) => {
      const redisClient = getRedisClient();
      try {
        const validTitle = checkNonEmptyString(title, 'title');
        const validDate = checkValidDate(releaseDate, 'releaseDate');
        const validGenre = checkMusicGenre(genre);
        // 对于 extra credit，songs 由 Song 独立处理，因此忽略传入的 songs 数组
        const artistObjId = new ObjectId(artistId);
        const companyObjId = new ObjectId(companyId);
        const artistsCollection = await artistsCollectionFn();
        const rcCollection = await recordCompaniesCollectionFn();
        const artist = await artistsCollection.findOne({ _id: artistObjId });
        if (!artist) {
          throw new GraphQLError(`Artist with id=${artistId} not found`);
        }
        const company = await rcCollection.findOne({ _id: companyObjId });
        if (!company) {
          throw new GraphQLError(`RecordCompany with id=${companyId} not found`);
        }
        const albumsCollection = await albumsCollectionFn();
        const newAlbum = {
          _id: new ObjectId(),
          title: validTitle,
          releaseDate: validDate,
          genre: validGenre,
          artistId: artistObjId,
          recordCompanyId: companyObjId
        };
        const insertResult = await albumsCollection.insertOne(newAlbum);
        if (!insertResult.acknowledged) {
          throw new GraphQLError('Could not add Album');
        }
        await redisClient.del('all_albums');
        const returned = {
          id: newAlbum._id.toString(),
          title: newAlbum.title,
          releaseDate: newAlbum.releaseDate,
          genre: newAlbum.genre,
          artistId: newAlbum.artistId,
          recordCompanyId: newAlbum.recordCompanyId
        };
        await redisClient.set(`album:${returned.id}`, JSON.stringify(returned));
        await redisClient.del(`songs:${artistId}`);
        return returned;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    editAlbum: async (_, { _id, title, releaseDate, genre, songs, artistId, companyId }) => {
      const redisClient = getRedisClient();
      try {
        const albumObjId = new ObjectId(_id);
        const albumsCollection = await albumsCollectionFn();
        const artistsCollection = await artistsCollectionFn();
        const rcCollection = await recordCompaniesCollectionFn();
        const albumDoc = await albumsCollection.findOne({ _id: albumObjId });
        if (!albumDoc) {
          throw new GraphQLError(`Album with id=${_id} not found`);
        }
        const updateFields = {};
        if (typeof title === 'string') {
          updateFields.title = checkNonEmptyString(title, 'title');
        }
        if (typeof releaseDate === 'string') {
          updateFields.releaseDate = checkValidDate(releaseDate, 'releaseDate');
        }
        if (genre) {
          updateFields.genre = checkMusicGenre(genre);
        }
        // 对于 extra credit，songs 由 Song mutations 处理
        if (artistId && artistId !== albumDoc.artistId?.toString()) {
          const newArtistObjId = new ObjectId(artistId);
          const newArtist = await artistsCollection.findOne({ _id: newArtistObjId });
          if (!newArtist) {
            throw new GraphQLError(`Artist with id=${artistId} not found`);
          }
          if (albumDoc.artistId) {
            await artistsCollection.updateOne(
              { _id: albumDoc.artistId },
              { $pull: { albums: albumObjId } }
            );
          }
          await artistsCollection.updateOne(
            { _id: newArtistObjId },
            { $addToSet: { albums: albumObjId } }
          );
          updateFields.artistId = newArtistObjId;
        }
        if (companyId && companyId !== albumDoc.recordCompanyId?.toString()) {
          const newCompanyObjId = new ObjectId(companyId);
          const newCompany = await rcCollection.findOne({ _id: newCompanyObjId });
          if (!newCompany) {
            throw new GraphQLError(`RecordCompany with id=${companyId} not found`);
          }
          if (albumDoc.recordCompanyId) {
            await rcCollection.updateOne(
              { _id: albumDoc.recordCompanyId },
              { $pull: { albums: albumObjId } }
            );
          }
          await rcCollection.updateOne(
            { _id: newCompanyObjId },
            { $addToSet: { albums: albumObjId } }
          );
          updateFields.recordCompanyId = newCompanyObjId;
        }
        if (!Object.keys(updateFields).length) {
          throw new GraphQLError('No valid fields provided to update');
        }
        const updateResult = await albumsCollection.updateOne(
          { _id: albumObjId },
          { $set: updateFields }
        );
        if (!updateResult.matchedCount) {
          throw new GraphQLError(`Album with id=${_id} was not found or not updated`);
        }
        await redisClient.del('all_albums');
        await redisClient.del(`album:${_id}`);
        if (updateFields.artistId) {
          if (albumDoc.artistId) {
            await redisClient.del(`songs:${albumDoc.artistId.toString()}`);
          }
          await redisClient.del(`songs:${artistId}`);
        }
        const updatedAlbum = await albumsCollection.findOne({ _id: albumObjId });
        return {
          id: updatedAlbum._id.toString(),
          title: updatedAlbum.title,
          releaseDate: updatedAlbum.releaseDate,
          genre: updatedAlbum.genre,
          artistId: updatedAlbum.artistId,
          recordCompanyId: updatedAlbum.recordCompanyId
        };
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    removeAlbum: async (_, { _id }) => {
      const redisClient = getRedisClient();
      try {
        const albumObjId = new ObjectId(_id);
        const albumsCollection = await albumsCollectionFn();
        const artistsCollection = await artistsCollectionFn();
        const rcCollection = await recordCompaniesCollectionFn();
        const albumDoc = await albumsCollection.findOne({ _id: albumObjId });
        if (!albumDoc) {
          throw new GraphQLError(`Album with id=${_id} not found`);
        }
        const artistId = albumDoc.artistId?.toString();
        const companyId = albumDoc.recordCompanyId?.toString();
        const deleteResult = await albumsCollection.deleteOne({ _id: albumObjId });
        if (!deleteResult.deletedCount) {
          throw new GraphQLError(`Could not delete album with id=${_id}`);
        }
        if (artistId) {
          await artistsCollection.updateOne(
            { _id: new ObjectId(artistId) },
            { $pull: { albums: albumObjId } }
          );
        }
        if (companyId) {
          await rcCollection.updateOne(
            { _id: new ObjectId(companyId) },
            { $pull: { albums: albumObjId } }
          );
        }
        // 删除与该 album 关联的所有 songs
        const songsCollection = await songsCollectionFn();
        await songsCollection.deleteMany({ albumId: albumObjId });
        await redisClient.del('all_albums');
        await redisClient.del(`album:${_id}`);
        if (artistId) {
          await redisClient.del(`songs:${artistId}`);
          await redisClient.del(`artist:${artistId}`);
        }
        if (companyId) {
          await redisClient.del(`company:${companyId}`);
        }
        await redisClient.del(`songs:album:${_id}`);
        return {
          id: albumDoc._id.toString(),
          title: albumDoc.title,
          releaseDate: albumDoc.releaseDate,
          genre: albumDoc.genre,
          artistId: albumDoc.artistId,
          recordCompanyId: albumDoc.recordCompanyId
        };
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    // --- New Song Mutations ---
    addSong: async (_, { title, duration, albumId }) => {
      const redisClient = getRedisClient();
      try {
        const validTitle = checkNonEmptyString(title, 'title');
        const validDuration = checkSongDuration(duration, 'duration');
        const albumObjId = new ObjectId(albumId);
        const albumsCollection = await albumsCollectionFn();
        const albumDoc = await albumsCollection.findOne({ _id: albumObjId });
        if (!albumDoc) {
          throw new GraphQLError(`Album with id=${albumId} not found`);
        }
        const songsCollection = await songsCollectionFn();
        const newSong = {
          _id: new ObjectId(),
          title: validTitle,
          duration: validDuration,
          albumId: albumObjId
        };
        const insertResult = await songsCollection.insertOne(newSong);
        if (!insertResult.acknowledged) {
          throw new GraphQLError('Could not add Song');
        }
        await redisClient.del(`songs:album:${albumId}`);
        const returned = {
          id: newSong._id.toString(),
          title: newSong.title,
          duration: newSong.duration,
          albumId: newSong.albumId
        };
        await redisClient.set(`song:${returned.id}`, JSON.stringify(returned));
        return returned;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    editSong: async (_, { _id, title, duration, albumId }) => {
      const redisClient = getRedisClient();
      try {
        const songObjId = new ObjectId(_id);
        const songsCollection = await songsCollectionFn();
        const updateFields = {};
        if (typeof title === 'string') {
          updateFields.title = checkNonEmptyString(title, 'title');
        }
        if (typeof duration === 'string') {
          updateFields.duration = checkSongDuration(duration, 'duration');
        }
        if (albumId && albumId !== undefined) {
          const newAlbumObjId = new ObjectId(albumId);
          const albumsCollection = await albumsCollectionFn();
          const albumDoc = await albumsCollection.findOne({ _id: newAlbumObjId });
          if (!albumDoc) {
            throw new GraphQLError(`Album with id=${albumId} not found`);
          }
          updateFields.albumId = newAlbumObjId;
        }
        if (!Object.keys(updateFields).length) {
          throw new GraphQLError('No valid fields provided to update');
        }
        const updateResult = await songsCollection.updateOne(
          { _id: songObjId },
          { $set: updateFields }
        );
        if (!updateResult.matchedCount) {
          throw new GraphQLError(`Song with id=${_id} not found or not updated`);
        }
        await redisClient.del(`song:${_id}`);
        if (albumId) {
          await redisClient.del(`songs:album:${albumId}`);
        }
        const updatedSong = await songsCollection.findOne({ _id: songObjId });
        const returned = {
          id: updatedSong._id.toString(),
          title: updatedSong.title,
          duration: updatedSong.duration,
          albumId: updatedSong.albumId
        };
        await redisClient.set(`song:${_id}`, JSON.stringify(returned));
        return returned;
      } catch (e) {
        throw new GraphQLError(e);
      }
    },

    removeSong: async (_, { _id }) => {
      const redisClient = getRedisClient();
      try {
        const songObjId = new ObjectId(_id);
        const songsCollection = await songsCollectionFn();
        const songDoc = await songsCollection.findOne({ _id: songObjId });
        if (!songDoc) {
          throw new GraphQLError(`Song with id=${_id} not found`);
        }
        const albumId = songDoc.albumId.toString();
        const deleteResult = await songsCollection.deleteOne({ _id: songObjId });
        if (!deleteResult.deletedCount) {
          throw new GraphQLError(`Could not delete song with id=${_id}`);
        }
        await redisClient.del(`song:${_id}`);
        await redisClient.del(`songs:album:${albumId}`);
        return {
          id: songDoc._id.toString(),
          title: songDoc.title,
          duration: songDoc.duration,
          albumId: songDoc.albumId
        };
      } catch (e) {
        throw new GraphQLError(e);
      }
    }
  }
};
