const { mysql } = require('../qcloud')
const { message: { checkSignature } } = require('../qcloud')
const { ERRORS } = require('../constants')

async function getInfo(ctx, next) {
    // 通过 Koa 中间件进行登录态校验之后
    // 登录信息会被存储到 ctx.state.$wxInfo
    // 具体查看：
    const { open_id } = ctx.query
    var temp = await mysql('Users').where('open_id', open_id)

    if (temp.length == 0) {
        // 如果没找到openid，新添用户
        var user = {
            open_id: open_id,
            isSignUp: 0,
            user_name: "",
            user_id: ""
        }
        await mysql("Users").insert(user)

        ctx.state.data['user'] = {
            isSignUp: 0,
            user_name: "",
            user_id: ""
        }
    } else {
        // 如果找到openid，获取用户
        ctx.state.data['user'] = {
            isSignUp: temp[0].isSignUp,
            user_name: temp[0].user_name,
            user_id: temp[0].user_id
        }
    }
}

async function setInfo(ctx, next) {
    const { open_id, user_name, user_id } = ctx.query

    var judgeStr = judgeFormat(user_name, user_id)

    if (judgeStr.length == 0) {
        await mysql('Users')
            .where('open_id', open_id)
            .update({
                user_name: user_name,
                user_id: user_id,
                isSignUp: 1
            })

        ctx.body = "success"
    } else {
        ctx.body = {
            error: judgeStr
        }
    }
}

function judgeFormat(user_name, user_id) {
    if (user_id == "") {
        return ERRORS.ERR_WHEN_SET_USER_ID
    }
    if (user_name == "") {
        return ERRORS.ERR_WHEN_SET_USER_NAME
    } else {
        return ''
    }
}

module.exports = {
    setInfo,
    getInfo
}
