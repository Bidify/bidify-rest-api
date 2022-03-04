var express = require('express');
var Auction = require('../models/auction');
var Collection = require('../models/collection')

var auctionRouter = express.Router();
auctionRouter
    .route('/admin')
    .post(function (request, response) {

        Auction.insertMany(request.body).then(function(){
            console.log("Data inserted")  // Success
            response.status(201).send("success")
        }).catch(function(error){
            console.log(error)      // Failure
            response.status(500).send(error);
        });

        // response.status(201).send(auction);
    })
auctionRouter
    .route('/auctions')
    .post(async (request, response) => {

        console.log('POST /auctions');

        var auction = new Auction(request.body);

        await auction.save();

        await Collection.deleteOne({ token: request.body.token, network: request.body.network })

        response.status(201).send(auction);
    })
    .get(function (request, response) {

        console.log('GET /auctions');
        console.log(request.query.chainId)

        Auction.find({network: request.query.chainId, paidOut: false}, function (error, auctions) {

            if (error) {
                response.status(500).send(error);
                return;
            }

            // console.log(auctions);

            response.json(auctions);
        });
    });

auctionRouter
    .route('/auctions/:auctionId')
    .get(function (request, response) {

        console.log('GET /auctions/:auctionId');

        var auctionId = request.params.auctionId;

        Auction.findOne({ id: auctionId }, function (error, auction) {

            if (error) {
                response.status(500).send(error);
                return;
            }

            console.log(auction);

            response.json(auction);

        });
    })
    .put(function (request, response) {

        var auctionId = request.params.auctionId;

        console.log('PUT /auctions/:auctionId');
        
        let update = new Auction(request.body)
        // return console.log(Object.keys(request.body))\
        const isFinished = request.body.paidOut
        // return console.log(isFinished)
        Auction.findOneAndUpdate({ id: auctionId, network: request.body.network }, request.body, async (error, auction) => {

            if (error) {
                // console.error(error.message)
                response.status(500).send(error);
                return;
            }

            if (auction) {
                // console.log("success!!!!!!")
                const collection = new Collection(request.body)
                await collection.save()
                response.json(update);
                return;
            }

            response.status(404).json({
                message: 'Auction with id ' + auctionId + ' was not found.'
            });
        });
    })
    .delete(function (request, response) {

        console.log('DELETE /auctions/:auctionId');

        var auctionId = request.params.auctionId;

        Auction.findOne({ id: auctionId }, function (error, auction) {

            if (error) {
                response.status(500).send(error);
                return;
            }

            if (auction) {
                auction.remove(function (error) {

                    if (error) {
                        response.status(500).send(error);
                        return;
                    }

                    response.status(200).json({
                        'message': 'Auction with id ' + auctionId + ' was removed.'
                    });
                });
            } else {
                response.status(404).json({
                    message: 'Auction with id ' + auctionId + ' was not found.'
                });
            }
        });
    });
    
    auctionRouter
    .route('/admincollection')
    .post(function (request, response) {

        Collection.insertMany(request.body).then(function(){
            console.log("Data inserted")  // Success
            response.status(201).send("success")
        }).catch(function(error){
            console.log(error)      // Failure
            response.status(500).send(error);
        });

        // response.status(201).send(auction);
    })
    auctionRouter
    .route('/collection')
    .post(function (request, response) {

        console.log('POST /collections');

        var auction = new Auction(request.body);

        auction.save();

        response.status(201).send(auction);
    })
    .get(function (request, response) {

        const { chainId, owner } = request.query

        console.log('GET /collections', owner);

        Collection.find({network: chainId, owner: owner}, function (error, nfts) {

            if (error) {
                response.status(500).send(error);
                return;
            }

            // console.log(auctions);

            response.json(nfts);
        });
    });

// auctionRouter
//     .route('/auctions/:auctionId')
//     .get(function (request, response) {

//         console.log('GET /auctions/:auctionId');

//         var auctionId = request.params.auctionId;

//         Auction.findOne({ id: auctionId }, function (error, auction) {

//             if (error) {
//                 response.status(500).send(error);
//                 return;
//             }

//             console.log(auction);

//             response.json(auction);

//         });
//     })
//     .put(function (request, response) {

//         var auctionId = request.params.auctionId;

//         console.log('PUT /auctions/:auctionId');
        
//         let update = new Auction(request.body)
//         // return console.log(Object.keys(request.body))
//         Auction.findOneAndUpdate({ id: auctionId, network: request.body.network }, request.body, function (error, auction) {

//             if (error) {
//                 // console.error(error.message)
//                 response.status(500).send(error);
//                 return;
//             }

//             if (auction) {
//                 // console.log("success!!!!!!")
//                 response.json(update);
//                 return;
//             }

//             response.status(404).json({
//                 message: 'Auction with id ' + auctionId + ' was not found.'
//             });
//         });
//     })
//     .delete(function (request, response) {

//         console.log('DELETE /auctions/:auctionId');

//         var auctionId = request.params.auctionId;

//         Auction.findOne({ id: auctionId }, function (error, auction) {

//             if (error) {
//                 response.status(500).send(error);
//                 return;
//             }

//             if (auction) {
//                 auction.remove(function (error) {

//                     if (error) {
//                         response.status(500).send(error);
//                         return;
//                     }

//                     response.status(200).json({
//                         'message': 'Auction with id ' + auctionId + ' was removed.'
//                     });
//                 });
//             } else {
//                 response.status(404).json({
//                     message: 'Auction with id ' + auctionId + ' was not found.'
//                 });
//             }
//         });
//     });

module.exports = auctionRouter;