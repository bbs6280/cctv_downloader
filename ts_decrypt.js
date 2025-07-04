﻿//
// 依赖当前目录下这些文件
//
// h5.worker_patch.js
//

'use strict';

//
//////////////////////////////////////////////////////////////////////////
//

let argv    = process.argv;
let ifile   = argv[2];
let ofile   = argv[3];
let fs      = require( 'fs' );

//
//////////////////////////////////////////////////////////////////////////
//

function get_binary_from_file ( file ) {
    try {
        let data    = fs.readFileSync( file );
        return Uint8Array.from( data );
    }
    catch ( error ) {
        console.error( error );
        throw error;
    }
}

function save_binary ( buf, file ) {
    try {
        fs.writeFileSync( file, buf );
        console.log( '\nsave_binary succeeded' );
    }
    catch ( error ) {
        console.error( error );
        throw error;
    }
}

//
//////////////////////////////////////////////////////////////////////////
//

let CNTVModule          = require( './h5.worker_patch.js' );
let CNTVH5PlayerModule  = CNTVModule();

function XOR ( e ) {
    let i   = 0,
        j   = 0,
        n   = 0,
        r   = new Uint8Array,
        a   = 0;
    try {
        i = CNTVH5PlayerModule._jsmalloc( e.byteLength + 1024 );
        j = CNTVH5PlayerModule._jsmalloc( e.byteLength + 1024 );
        for ( let s = 0; s < e.byteLength; s++ ) {
            CNTVH5PlayerModule.HEAP8[i+s]   = e[s];
        }
        n   = CNTVH5PlayerModule.asm.func60_TEA( e.byteLength, i, j, 0n );
        r   = new Uint8Array( n );
        for ( let u = 0; u < r.byteLength; u++ ) {
            r[u]    = CNTVH5PlayerModule.HEAP8[j+u];
        }
    }
    catch ( err ) {
        return e
    }
    CNTVH5PlayerModule._jsfree( i );
    i   = null;
    CNTVH5PlayerModule._jsfree( j );
    j   = null;
    return r;
}

//
//////////////////////////////////////////////////////////////////////////
//

function FindNalUnitStart ( buf, pos, total ) {
    while ( pos+2 < total ) {
        switch ( buf[pos+2] ) {
        case 0 :
            if ( pos+3 < total && buf[pos+1] === 0 && buf[pos+3] === 1 ) {
                return pos+1;
            }
            pos    += 2;
            break;
        case 1 :
            if ( buf[pos] === 0 && buf[pos+1] === 0 ) {
                return pos;
            }
        default:
            pos    += 3;
            break;
        }
    }
    return total;
}

function Parse_NALArray ( buf ) {
    let begin   = 0,
        end,
        size;
    let total   = buf.length;
    let nal_unit_type;
    while ( begin < total ) {
        begin  += 3;
        end     = FindNalUnitStart( buf, begin+1, total );
        size    = end - begin;
        nal_unit_type
                = buf[begin] & 0x1f;
        if ( nal_unit_type === 1 || nal_unit_type === 5 || nal_unit_type === 25 ) {
            let e   = new Uint8Array( buf.slice( begin, begin+size ) );
            let r   = XOR( e );
            for ( let i = 0; i < r.length; i++ ) {
                buf[begin+i]    = r[i];
            }
        }
        begin   = end;
    }
}

function Scatter_PES ( buf, ctx ) {
    let k   = 0;
    for ( let i = 0; i < ctx.offarray.length; i++ ) {
        for ( let j = ctx.offarray[i]; j < ctx.indexarray[i]+188; j++ ) {
            buf[j]  = ctx.PES[k++];
        }
    }
}

function Parse_TS_Packet ( buf, index, ctx ) {
    let PID     = ( ( buf[index+1] & 0x1f ) << 8 ) + buf[index+2];
    let PUSI    = ( buf[index+1] & 0x40 ) >>> 6;
    if ( PID !== 0x100 ) {
        return;
    }
    let AdaptationFieldControl
                = ( buf[index+3] & 0x30 ) >>> 4;
    if ( PUSI === 1 ) {
        if ( ctx.tscount > 0 ) {
            let begin   = ~~(ctx.indexarray[0] / 188);
            let end     = ~~(ctx.indexarray.at(-1) / 188);
            Parse_NALArray( ctx.PES );
            Scatter_PES( buf, ctx );
            ctx.tscount = 0;
        }
    }
    let AdaptationFieldLength;
    let payload_index;
    let payload;
    switch ( AdaptationFieldControl ) {
    case 1 :
        payload_index   = index + 4;
        payload         = buf.slice( payload_index, index+188 );
        break;
    case 2 :
        AdaptationFieldLength
                        = buf[index+4];
        process.exit( 0 );
        break;
    case 3 :
        AdaptationFieldLength
                        = buf[index+4];
        payload_index   = index + 4 + 1 + AdaptationFieldLength;
        payload         = buf.slice( payload_index, index+188 );
        break;
    default :
        process.exit( 0 );
        break;
    }
    if ( PUSI === 1 ) {
        ctx.indexarray  = [index];
        ctx.PES         = [...payload];
        ctx.offarray    = [payload_index];
        ctx.tscount++;
    }
    else {
        ctx.indexarray.push( index );
        ctx.PES.push( ...payload );
        ctx.offarray.push( payload_index );
        ctx.tscount++;
    }
}

function Parse_TS ( buf ) {
    let ctx     = {
        indexarray  : undefined,
        PES         : undefined,
        offarray    : undefined,
        tscount     : 0,
    }
    for ( let index = 0; index < buf.length; index += 188 ) {
        if ( buf[index] === 0x47 ) {
            Parse_TS_Packet( buf, index, ctx );
        }
        else {
            process.exit( 0 );
        }
    }
    if ( ctx.tscount > 0 ) {
        let begin   = ~~(ctx.indexarray[0] / 188);
        let end     = ~~(ctx.indexarray.at(-1) / 188);
        Parse_NALArray( ctx.PES );
        Scatter_PES( buf, ctx );
        ctx.tscount = 0;
    }
}

//
//////////////////////////////////////////////////////////////////////////
//

CNTVH5PlayerModule.onRuntimeInitialized = () => {

(async() => {

let buf = get_binary_from_file( ifile );

Parse_TS( buf );
save_binary ( buf, ofile );

})();

};
