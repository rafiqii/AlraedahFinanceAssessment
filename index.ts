//imports
import {Context ,Markup, Telegraf, Telegram } from "telegraf"
import { keyboard } from "telegraf/typings/markup"
import {Context as TelegrafContext} from 'telegraf'

//Session interface
interface MySession {
    userID:number
    nameOfUser:String 
    numberOfReviewsForThisUser: number
    questionCounter: number
    qualityOfProduct:String
    priceOfProduct:number
    pictureOfProductLink: String
    location: String
    /*
    for questionCounter var it indicates which question the user is on, question order goes like this:
    0 - did not start review
    1 - quality question
    2 - price
    3 - pysical status: picture
    4 - location of shipment
    */
    // quaity  Values: Very good, good,no opinion, bad, very bad;
}
interface MyContext extends TelegrafContext {
    session: MySession
}
//constants
const Session = require('telegraf-session-local/lib/session')
const bot= new Telegraf<MyContext>('1887952507:AAGbuOkFNADN1pPCFS8Zk48Y9tLj4EbeoW4') //insert bot token here
const telegram = new Telegram('1887952507:AAGbuOkFNADN1pPCFS8Zk48Y9tLj4EbeoW4')
const session= new Session()
const fs = require('fs')

//setting session to the bot
bot.use(session)

//Commenly used commands
bot.start((ctx)=>{
    ctx.reply("Hello and welcome to MEE6 product quality check! Where you can give us your precious opinion on our products.\nTo start a new review use /review \n You can look at the list of commands in the /help menu")
    ctx.session.questionCounter=0
    ctx.session.nameOfUser=ctx.message.from.first_name
    ctx.session.userID=ctx.from.id
})
bot.help((ctx) =>{
    ctx.reply('Welcome to the /help Menu \nList of commands:\n/review : Starts a new review\n/exit : Exits the current review') 
})
bot.hears('/exit', (ctx) =>{
    if(ctx.session.questionCounter==0)
    {
        ctx.reply('You are currently not in a review session')
    }
    else
    {
        ctx.session.questionCounter=0
        ctx.session.qualityOfProduct=''
        ctx.session.priceOfProduct=0
        ctx.session.pictureOfProductLink= ''
        ctx.session.location= ''
        ctx.reply('Exited current review successfully to start a new one, use /review')
    }
})
bot.hears('/review', (ctx)=>{
    if(ctx.session.questionCounter==0)
    {
        ctx.reply("how did you find the quality of the product?", Markup.keyboard(['Very good', 'Good','No opinion', 'Bad', 'Very bad']).oneTime().resize())
        ctx.session.questionCounter=1
    }
    else
    {
        ctx.reply("You are currently doing a review, if you want restart please use /exit and then /review")
    }
    
})

bot.on('photo',async (ctx)=>
{
    
    if(ctx.session.questionCounter==3)
    {
        try 
        {
            ctx.session.pictureOfProductLink=( await (await telegram.getFileLink(ctx.message.photo[0].file_id)).href)
            ctx.session.questionCounter=4
            ctx.reply('Please send us your current location')
        }
        catch(error)
        {
            console.log(error)
        }
    }
    else
    {
        ctx.reply('You dont need to send a photo right now')
    }
})

//chain of logical events
bot.on('text', (ctx, next) =>{
    switch(ctx.session.questionCounter)
    {
        case 1:
            if(steralizeText(ctx.message.text))
            {
                ctx.session.qualityOfProduct=ctx.message.text
                ctx.session.questionCounter=2
                ctx.reply('Enter the cost of the product')
            }
            else
            {
                ctx.reply('Please reply with the given options (Very good, Good, No opinion, Bad, Very bad', Markup.keyboard(['Very good', 'Good','No opinion', 'Bad', 'Very bad']).oneTime().resize())
            }
        break

        case 2:
            try 
            {
                //to check if its a number/ positive number
                if(Number(ctx.message.text)>=0)
                {
                    ctx.session.priceOfProduct=Number(ctx.message.text)
                    ctx.reply('Please send a compressed picture of the product')
                    ctx.session.questionCounter=3
                }
                else
                {
                    ctx.reply('Please enter a positive number')
                }            
            }
            catch(e)
            {
                ctx.reply('Please enter a posotive number')
            }
        break

        case 4:
            if(ctx.message.text.includes('google.com/maps'))
            {
                ctx.session.location=ctx.message.text
                next()
            }
            else
            {
                ctx.reply('This is not a google maps link')
            }
        break
        default:
            ctx.reply('This is not an expected input')
        break
    }
})
        

bot.on('location',(ctx, next) =>{
    if(ctx.session.questionCounter==4)
    {
        ctx.session.location="https://www.google.com/maps/place/"+ ctx.message.location.latitude + "," +ctx.message.location.longitude
        next()
    }
    else
    {
        ctx.reply('You dont need to send the location right now')
    }
})

//saving info and ending the session with the customer
bot.use( async (ctx, next)=>{
    if(ctx.session.questionCounter==4){

        if(ctx.session.numberOfReviewsForThisUser== null)
        {
            ctx.session.numberOfReviewsForThisUser=1
        }
        else
        {
            ctx.session.numberOfReviewsForThisUser++
        }
        ctx.reply('Thank you for your review, you can always start a new /review and have a good day :D')
        await next()
        ctx.session.questionCounter=0
    }
    else
    {
        ctx.reply('Please compress the picture')
    }
})
bot.use(async (ctx) =>{
    try
    {
        fs.writeFileSync(`./userInfo/${ctx.session.userID} Review ${ctx.session.numberOfReviewsForThisUser}.json`, JSON.stringify(ctx.session))
    }
    catch(e)
    {
        console.log(e)
    }
})
//Functions
function steralizeText(input:String){
    //i can use an if statement but i think switch looks neater and cooler :D
    switch(input.toLowerCase())
    {
        case 'very good':
        case 'good':
        case 'no opinion':
        case 'bad':
        case 'very bad':
        return true
        break
        default:
        return false
        break

    }
}

bot.launch()